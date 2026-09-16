import { onRequest } from 'firebase-functions/v2/https';
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as crypto from 'crypto';
import {
  sendApplicationReceivedEmail,
  sendNewApplicationAdminNotificationEmail,
  sendApplicationStatusEmail,
  sendPurchaseConfirmationEmail
} from './services/email.service';

// Inicializar Firebase Admin SDK
initializeApp();
const db = getFirestore();

/**
 * Fórmula estándar Lemon Squeezy: 5% + $0.50 USD por transacción.
 * Reparto: 30% TokiDev Plataforma / 70% Profesor.
 */
function calculateSplit(grossAmount: number, platformSharePercentage = 30) {
  const validPrice = Math.max(0, grossAmount);
  if (validPrice === 0) {
    return {
      grossAmount: 0,
      gatewayFee: 0,
      netAmount: 0,
      platformFeePercentage: platformSharePercentage,
      platformFeeAmount: 0,
      instructorEarnings: 0
    };
  }

  const gatewayFee = Number(((validPrice * 0.05) + 0.50).toFixed(2));
  const netAmount = Number(Math.max(0, validPrice - gatewayFee).toFixed(2));
  const platformFeeAmount = Number((netAmount * (platformSharePercentage / 100)).toFixed(2));
  const instructorEarnings = Number((netAmount - platformFeeAmount).toFixed(2));

  return {
    grossAmount: validPrice,
    gatewayFee,
    netAmount,
    platformFeePercentage: platformSharePercentage,
    platformFeeAmount,
    instructorEarnings
  };
}

/**
 * Cloud Function HTTPS para recibir Webhooks de Lemon Squeezy en tiempo real
 */
export const lemonSqueezyWebhook = onRequest(
  {
    cors: true
  },
  async (req, res) => {
    // 1. Manejo de comprobación de salud (Health Check)
    if (req.method === 'GET') {
      res.status(200).send({ status: 'active', service: 'TokiDev Lemon Squeezy Webhook v2' });
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).send({ error: 'Method Not Allowed' });
      return;
    }

    try {
      const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || 'tokidev_secret_seguro_2026';
      const signatureHeader = req.headers['x-signature'];

      // 2. Validación de firma HMAC SHA-256
      if (signatureHeader && secret) {
        const rawBody = (req as any).rawBody || JSON.stringify(req.body);
        const hmac = crypto.createHmac('sha256', secret);
        const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
        const signature = Buffer.from(String(signatureHeader), 'utf8');

        if (digest.length !== signature.length || !crypto.timingSafeEqual(digest, signature)) {
          console.warn('[Webhook] Firma no válida recibida');
          res.status(401).send({ error: 'Firma de webhook inválida' });
          return;
        }
      }

      const eventName = req.headers['x-event-name'] || req.body?.meta?.event_name;
      console.log(`[LemonSqueezy Webhook] Evento recibido: ${eventName}`);

      const data = req.body?.data;
      const attributes = data?.attributes || {};
      const customMeta = req.body?.meta?.custom_data || attributes?.checkout_data?.custom || {};

      // 3. Procesamiento de orden de compra creada exitosamente
      if (eventName === 'order_created' || eventName === 'order_payment_success') {
        const gatewayOrderId = String(data?.id || `LS-${Date.now()}`);
        const grossPriceInCents = attributes.total || attributes.subtotal || 0;
        const grossPriceUsd = Number((grossPriceInCents / 100).toFixed(2));
        
        const studentEmail = (attributes.user_email || attributes.customer_email || '').toLowerCase().trim();
        const studentName = attributes.user_name || attributes.customer_name || 'Estudiante';
        const courseTitle = attributes.first_order_item?.product_name || 'Curso TokiDev';
        
        let courseId = customMeta.courseId || customMeta.course_id || '';
        let learningPathId = customMeta.learningPathId || customMeta.learning_path_id || '';
        let studentId = customMeta.studentId || customMeta.student_id || '';
        let instructorId = customMeta.instructorId || customMeta.instructor_id || '';
        let instructorName = customMeta.instructorName || customMeta.instructor_name || '';

        // Si no vino studentId por metadata, buscar al usuario en Firestore por su email
        if (!studentId && studentEmail) {
          const userSnap = await db.collection('users').where('email', '==', studentEmail).limit(1).get();
          if (!userSnap.empty) {
            studentId = userSnap.docs[0].id;
          }
        }

        // Si aún no tenemos studentId, usar el primer usuario estudiante disponible o fallback
        if (!studentId) {
          const anyStudent = await db.collection('users').where('role', '==', 'STUDENT').limit(1).get();
          if (!anyStudent.empty) {
            studentId = anyStudent.docs[0].id;
          } else {
            studentId = studentEmail ? studentEmail.replace(/[^a-zA-Z0-9]/g, '_') : 'guest_student';
          }
        }

        // Resolver Curso e Instructor desde Firestore si no vinieron en metadatos
        if (!learningPathId || !courseId) {
          const coursesSnap = await db.collection('courses').limit(1).get();
          if (!coursesSnap.empty) {
            const courseDoc = coursesSnap.docs[0];
            const cData = courseDoc.data();
            courseId = courseDoc.id;
            learningPathId = cData['learningPathId'] || courseDoc.id;
            instructorId = instructorId || cData['instructorId'] || 'instructor_demo';
            instructorName = instructorName || cData['instructorName'] || 'Profesor TokiDev';
          }
        }

        const split = calculateSplit(grossPriceUsd);

        // Verificar si la orden ya fue procesada (Idempotencia)
        const orderRef = db.collection('orders').doc(gatewayOrderId);
        const existingOrderSnap = await orderRef.get();
        const isAlreadyProcessed = existingOrderSnap.exists && existingOrderSnap.data()?.status === 'PAID';

        if (isAlreadyProcessed) {
          console.log(`[Webhook] ℹ️ La orden ${gatewayOrderId} ya fue procesada previamente. Omitiendo duplicación.`);
          res.status(200).send({ status: 'success', message: 'Orden ya procesada anteriormente' });
          return;
        }

        // A. Guardar orden en Firestore colección 'orders'
        await orderRef.set({
          id: gatewayOrderId,
          gatewayOrderId,
          paymentGateway: 'LEMON_SQUEEZY',
          status: 'PAID',
          studentId,
          studentName,
          studentEmail,
          courseId: courseId || 'course_default',
          courseTitle,
          learningPathId: learningPathId || 'path_default',
          instructorId: instructorId || 'instructor_demo',
          instructorName: instructorName || 'Profesor TokiDev',
          split,
          createdAt: FieldValue.serverTimestamp(),
          paidAt: FieldValue.serverTimestamp()
        }, { merge: true });

        // B. Acreditar ganancias en la billetera del instructor 'instructor_wallets'
        const targetInstructorId = instructorId || 'instructor_demo';
        const walletRef = db.collection('instructor_wallets').doc(targetInstructorId);
        await walletRef.set({
          instructorId: targetInstructorId,
          instructorName: instructorName || 'Profesor TokiDev',
          totalEarned: FieldValue.increment(split.instructorEarnings),
          availableBalance: FieldValue.increment(split.instructorEarnings),
          pendingPayout: FieldValue.increment(0),
          totalPaidOut: FieldValue.increment(0),
          updatedAt: FieldValue.serverTimestamp()
        }, { merge: true });

        // C. Registrar matrícula en la colección global 'enrollments' (para que el alumno lo vea de inmediato)
        if (learningPathId && studentId) {
          const enrollmentId = `${studentId}_${learningPathId}`;
          const enrollmentRef = db.collection('enrollments').doc(enrollmentId);
          await enrollmentRef.set({
            id: enrollmentId,
            userId: studentId,
            pathId: learningPathId,
            enrolledAt: FieldValue.serverTimestamp(),
            progressPercentage: 0,
            status: 'active'
          }, { merge: true });

          // Actualizar contador de estudiantes en el curso
          if (courseId) {
            await db.collection('courses').doc(courseId).update({
              studentsCount: FieldValue.increment(1)
            }).catch(() => {});
          }
        }

        // D. Enviar notificaciones en tiempo real a los roles afectados
        // 1. Notificación al Profesor (Venta y ganancia)
        await db.collection('notifications').add({
          userId: targetInstructorId,
          recipientRole: 'INSTRUCTOR',
          type: 'PURCHASE_INSTRUCTOR',
          title: '🎉 ¡Nueva venta de curso!',
          message: `${studentName} adquirió "${courseTitle}". Ganaste $${split.instructorEarnings} USD.`,
          link: '/instructor/dashboard',
          read: false,
          createdAt: FieldValue.serverTimestamp(),
          metadata: {
            orderId: gatewayOrderId,
            courseId,
            courseTitle,
            studentName,
            studentEmail,
            amount: split.instructorEarnings
          }
        }).catch(e => console.warn('[Webhook] Error creando notificación para profesor:', e));

        // 2. Notificación al Estudiante (Confirmación de matrícula y acceso)
        if (studentId) {
          await db.collection('notifications').add({
            userId: studentId,
            recipientRole: 'STUDENT',
            type: 'PURCHASE_STUDENT',
            title: '🎓 ¡Compra confirmada!',
            message: `Tu pago por "${courseTitle}" se procesó exitosamente. ¡Ya puedes acceder a todo el contenido!`,
            link: `/courses/${courseId || learningPathId}/learn`,
            read: false,
            createdAt: FieldValue.serverTimestamp(),
            metadata: {
              orderId: gatewayOrderId,
              courseId,
              courseTitle
            }
          }).catch(e => console.warn('[Webhook] Error creando notificación para estudiante:', e));
        }

        // 3. Notificación a los Administradores
        await db.collection('notifications').add({
          userId: 'ADMIN_ROLE',
          recipientRole: 'ADMIN',
          type: 'SYSTEM',
          title: '💰 Nueva venta en la plataforma',
          message: `${studentName} compró "${courseTitle}" por $${grossPriceUsd} USD.`,
          link: '/admin',
          read: false,
          createdAt: FieldValue.serverTimestamp(),
          metadata: {
            orderId: gatewayOrderId,
            courseTitle,
            grossPriceUsd
          }
        }).catch(e => console.warn('[Webhook] Error creando notificación para admin:', e));

        // 4. Enviar correo electrónico de confirmación de compra con recibo
        if (studentEmail) {
          sendPurchaseConfirmationEmail(
            studentEmail,
            studentName,
            courseTitle,
            grossPriceUsd,
            gatewayOrderId
          ).catch(e => console.warn('[Webhook] Error enviando correo de confirmación de compra:', e));
        }

        console.log(`[Webhook] ✅ Matrícula completada para usuario ${studentId} en ruta ${learningPathId}. Ganancia acreditada al docente ${targetInstructorId}: $${split.instructorEarnings} USD.`);
      }

      res.status(200).send({
        status: 'success',
        message: 'Webhook recibido y procesado correctamente',
        event: eventName
      });
    } catch (error: any) {
      console.error('[Webhook Error]', error);
      res.status(500).send({ error: error.message || 'Error interno del servidor' });
    }
  }
);

/**
 * Trigger Cloud Function: Se activa automáticamente cuando un estudiante envía una postulación a instructor
 */
export const onInstructorApplicationCreated = onDocumentCreated(
  'instructorApplications/{applicationId}',
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      return;
    }

    const data = snapshot.data();
    const applicantName = data?.userName || data?.displayName || data?.name || 'Futuro Instructor';
    const professionalTitle = data?.title || 'Instructor TokiDev';
    let applicantEmail = data?.userEmail || data?.email || '';

    // Si no está el correo en la postulación, obtenerlo del documento de usuario
    if (!applicantEmail && data?.userId) {
      const userDoc = await db.collection('users').doc(data.userId).get();
      if (userDoc.exists) {
        applicantEmail = userDoc.data()?.email || '';
      }
    }

    // 1. Enviar correo de confirmación al postulante
    if (applicantEmail) {
      console.log(`[Firestore Trigger] ✉️ Enviando correo de postulación recibida a ${applicantEmail}`);
      await sendApplicationReceivedEmail(applicantEmail, applicantName, professionalTitle);
    }

    // 2. Enviar correo de aviso a los Administradores
    try {
      const adminEmails = new Set<string>();

      // A. Buscar todos los usuarios con rol ADMIN en Firestore
      const adminUsersSnap = await db.collection('users').where('role', '==', 'ADMIN').get();
      adminUsersSnap.forEach(doc => {
        const email = doc.data()?.email;
        if (email && typeof email === 'string') {
          adminEmails.add(email.trim().toLowerCase());
        }
      });

      // B. Agregar emails configurados en variables de entorno como fallback
      if (process.env.ADMIN_EMAIL) {
        adminEmails.add(process.env.ADMIN_EMAIL.trim().toLowerCase());
      }
      if (process.env.SMTP_USER) {
        adminEmails.add(process.env.SMTP_USER.trim().toLowerCase());
      }

      console.log(`[Firestore Trigger] 📋 Notificando a ${adminEmails.size} administradores sobre nueva postulación...`);

      for (const adminEmail of adminEmails) {
        console.log(`[Firestore Trigger] ✉️ Enviando alerta de postulación a Admin: ${adminEmail}`);
        await sendNewApplicationAdminNotificationEmail(adminEmail, {
          applicantName,
          applicantEmail: applicantEmail || 'No especificado',
          title: professionalTitle,
          experienceYears: data?.experienceYears,
          specialties: data?.specialties,
          bio: data?.bio,
          courseProposal: data?.courseProposal
        });
      }
    } catch (adminErr) {
      console.error('[Firestore Trigger] Error notificando a los administradores por correo:', adminErr);
    }
  }
);

/**
 * Trigger Cloud Function: Se activa automáticamente cuando el Admin aprueba o rechaza una postulación
 */
export const onInstructorApplicationUpdated = onDocumentUpdated(
  'instructorApplications/{applicationId}',
  async (event) => {
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();

    if (!beforeData || !afterData) {
      return;
    }

    // Solo actuar si el estado cambió a APPROVED o REJECTED
    if (beforeData.status !== afterData.status && (afterData.status === 'APPROVED' || afterData.status === 'REJECTED')) {
      const applicantName = afterData.userName || afterData.displayName || afterData.name || 'Instructor';
      let applicantEmail = afterData.userEmail || afterData.email || '';

      if (!applicantEmail && afterData.userId) {
        const userDoc = await db.collection('users').doc(afterData.userId).get();
        if (userDoc.exists) {
          applicantEmail = userDoc.data()?.email || '';
        }
      }

      if (applicantEmail) {
        console.log(`[Firestore Trigger] ✉️ Enviando correo de estado (${afterData.status}) a ${applicantEmail}`);
        await sendApplicationStatusEmail(
          applicantEmail,
          applicantName,
          afterData.status,
          afterData.adminFeedback || afterData.rejectionReason || afterData.reviewNotes
        );
      }
    }
  }
);

