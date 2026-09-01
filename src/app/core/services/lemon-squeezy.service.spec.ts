import '@angular/compiler';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createEnvironmentInjector } from '@angular/core';
import { Router } from '@angular/router';
import { LemonSqueezyService } from './lemon-squeezy.service';
import { CourseService } from './course.service';

describe('LemonSqueezyService', () => {
  let service: LemonSqueezyService;
  let mockCourseService: any;
  let mockRouter: any;

  beforeEach(() => {
    mockCourseService = {
      enrollInPath: vi.fn().mockResolvedValue(undefined),
      selectPath: vi.fn(),
      getPathSlug: vi.fn().mockReturnValue('angular-pro')
    };

    mockRouter = {
      navigate: vi.fn().mockResolvedValue(true)
    };

    const injector = createEnvironmentInjector(
      [
        { provide: CourseService, useValue: mockCourseService },
        { provide: Router, useValue: mockRouter },
        LemonSqueezyService
      ]
    );

    service = injector.get(LemonSqueezyService);
  });

  it('debe inicializarse con señales reactivas en estado por defecto', () => {
    expect(service).toBeTruthy();
    expect(service.isScriptLoading()).toBe(false);
    expect(service.isCheckoutProcessing()).toBe(false);
    expect(service.lastOrder()).toBeNull();
  });

  describe('calculateSplit() - Desglose financiero', () => {
    it('debe manejar precio 0 correctamente', () => {
      const split = service.calculateSplit(0);
      expect(split.grossAmount).toBe(0);
      expect(split.gatewayFee).toBe(0);
      expect(split.netAmount).toBe(0);
      expect(split.platformFeeAmount).toBe(0);
      expect(split.instructorEarnings).toBe(0);
    });

    it('debe calcular comisiones correctamente para un curso de $4.00 USD', () => {
      // 5% de $4.00 = $0.20 + $0.50 fijo = $0.70 pasarela
      // Neto = $3.30
      // Plataforma (30%) = $0.99
      // Docente (70%) = $2.31
      const split = service.calculateSplit(4.00, 30);
      expect(split.grossAmount).toBe(4.00);
      expect(split.gatewayFee).toBe(0.70);
      expect(split.netAmount).toBe(3.30);
      expect(split.platformFeeAmount).toBe(0.99);
      expect(split.instructorEarnings).toBe(2.31);
    });

    it('debe calcular comisiones correctamente para un curso de $10.00 USD', () => {
      // 5% de $10.00 = $0.50 + $0.50 fijo = $1.00 pasarela
      // Neto = $9.00
      // Plataforma (30%) = $2.70
      // Docente (70%) = $6.30
      const split = service.calculateSplit(10.00, 30);
      expect(split.grossAmount).toBe(10.00);
      expect(split.gatewayFee).toBe(1.00);
      expect(split.netAmount).toBe(9.00);
      expect(split.platformFeeAmount).toBe(2.70);
      expect(split.instructorEarnings).toBe(6.30);
    });

    it('debe calcular comisiones correctamente para un curso de $20.00 USD', () => {
      // 5% de $20.00 = $1.00 + $0.50 fijo = $1.50 pasarela
      // Neto = $18.50
      // Plataforma (30%) = $5.55
      // Docente (70%) = $12.95
      const split = service.calculateSplit(20.00, 30);
      expect(split.grossAmount).toBe(20.00);
      expect(split.gatewayFee).toBe(1.50);
      expect(split.netAmount).toBe(18.50);
      expect(split.platformFeeAmount).toBe(5.55);
      expect(split.instructorEarnings).toBe(12.95);
    });

    it('debe soportar porcentaje de comisión personalizado de la plataforma (ej. 20%)', () => {
      // Curso de $50.00 USD con 20% para la plataforma
      // Pasarela: 5% ($2.50) + $0.50 = $3.00
      // Neto = $47.00
      // Plataforma (20% de $47) = $9.40
      // Docente (80% de $47) = $37.60
      const split = service.calculateSplit(50.00, 20);
      expect(split.grossAmount).toBe(50.00);
      expect(split.gatewayFee).toBe(3.00);
      expect(split.netAmount).toBe(47.00);
      expect(split.platformFeeAmount).toBe(9.40);
      expect(split.instructorEarnings).toBe(37.60);
    });
  });

  describe('validateCoupon() - Validación de Cupones y Descuentos', () => {
    it('debe aplicar un cupón del 50% correctamente (TOKIDEV50)', () => {
      const result = service.validateCoupon('TOKIDEV50', 20.00);
      expect(result.valid).toBe(true);
      expect(result.discountAmount).toBe(10.00);
      expect(result.finalPrice).toBe(10.00);
      expect(result.coupon?.code).toBe('TOKIDEV50');
    });

    it('debe aplicar un cupón del 100% beca completa (TOKIDEV100)', () => {
      const result = service.validateCoupon('TOKIDEV100', 35.00);
      expect(result.valid).toBe(true);
      expect(result.discountAmount).toBe(35.00);
      expect(result.finalPrice).toBe(0);
    });

    it('debe aplicar un cupón de monto fijo ($10 USD con PROMO10)', () => {
      const result = service.validateCoupon('PROMO10', 25.00);
      expect(result.valid).toBe(true);
      expect(result.discountAmount).toBe(10.00);
      expect(result.finalPrice).toBe(15.00);
    });

    it('debe rechazar cupones inexistentes o vacíos', () => {
      const emptyResult = service.validateCoupon('', 20.00);
      expect(emptyResult.valid).toBe(false);
      expect(emptyResult.finalPrice).toBe(20.00);

      const invalidResult = service.validateCoupon('CODIGO_INVENTADO', 20.00);
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.finalPrice).toBe(20.00);
    });
  });
});
