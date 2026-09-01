import { onRequest } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as crypto from 'crypto';

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

        // A. Guardar orden en Firestore colección 'orders'
        const orderRef = db.collection('orders').doc(gatewayOrderId);
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
