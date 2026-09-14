import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { LemonSqueezyService } from '../../../core/services/lemon-squeezy.service';
import { Order } from '../../../core/models/payment.model';
import { 
  LucideWallet, 
  LucideReceipt, 
  LucideCalendar, 
  LucideFilter
} from '@lucide/angular';

export interface MonthRoyaltySummary {
  monthKey: string;      // "2026-09"
  monthLabel: string;    // "Septiembre 2026"
  ordersCount: number;
  grossSales: number;
  gatewayFees: number;
  platformFees: number;
  instructorEarnings: number;
  orders: Order[];
}

@Component({
  selector: 'app-instructor-finances',
  imports: [
    LucideWallet,
    LucideReceipt,
    LucideCalendar,
    LucideFilter
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './instructor-finances.html'
})
export class InstructorFinancesComponent implements OnInit, OnDestroy {
  protected readonly authService = inject(AuthService);
  protected readonly lemonSqueezyService = inject(LemonSqueezyService);

  private unsubscribeWallet?: () => void;

  // Filtro de mes seleccionado
  protected readonly selectedMonthFilter = signal<string>('ALL');

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user?.id) {
      this.unsubscribeWallet = this.lemonSqueezyService.listenToInstructorWallet(user.id);
    }
  }

  ngOnDestroy(): void {
    if (this.unsubscribeWallet) {
      this.unsubscribeWallet();
    }
  }

  protected readonly myOrders = computed(() => {
    const user = this.authService.currentUser();
    const allOrders = this.lemonSqueezyService.orders();
    if (!user) return [];
    if (user.role === 'ADMIN') return allOrders;
    return allOrders.filter(o => o.instructorId === user.id || o.instructorId === 'platform');
  });

  /** Desglose mensual agrupado de regalías y órdenes */
  protected readonly monthlySummaries = computed<MonthRoyaltySummary[]>(() => {
    const orders = this.myOrders();
    const map = new Map<string, MonthRoyaltySummary>();

    for (const order of orders) {
      const date = order.paidAt ? order.paidAt.toDate() : order.createdAt ? order.createdAt.toDate() : new Date();
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const rawMonthName = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      const monthLabel = rawMonthName.charAt(0).toUpperCase() + rawMonthName.slice(1);

      const gross = order.split?.grossAmount || 0;
      const gateway = order.split?.gatewayFee || 0;
      const platform = order.split?.platformFeeAmount || 0;
      const instructor = order.split?.instructorEarnings || 0;

      if (!map.has(monthKey)) {
        map.set(monthKey, {
          monthKey,
          monthLabel,
          ordersCount: 1,
          grossSales: gross,
          gatewayFees: gateway,
          platformFees: platform,
          instructorEarnings: instructor,
          orders: [order]
        });
      } else {
        const item = map.get(monthKey)!;
        item.ordersCount += 1;
        item.grossSales += gross;
        item.gatewayFees += gateway;
        item.platformFees += platform;
        item.instructorEarnings += instructor;
        item.orders.push(order);
      }
    }

    return Array.from(map.values()).sort((a, b) => b.monthKey.localeCompare(a.monthKey));
  });

  protected readonly filteredOrders = computed(() => {
    const selected = this.selectedMonthFilter();
    if (selected === 'ALL') {
      return this.myOrders();
    }
    const targetMonth = this.monthlySummaries().find(m => m.monthKey === selected);
    return targetMonth ? targetMonth.orders : [];
  });

  protected readonly totalGrossSum = computed(() => {
    return this.myOrders().reduce((sum, o) => sum + (o.split?.grossAmount || 0), 0);
  });

  protected readonly totalInstructorEarnings = computed(() => {
    return this.myOrders().reduce((sum, o) => sum + (o.split?.instructorEarnings || 0), 0);
  });

  protected readonly totalGatewayFees = computed(() => {
    return this.myOrders().reduce((sum, o) => sum + (o.split?.gatewayFee || 0), 0);
  });

  protected readonly currentSelectedMonthSummary = computed(() => {
    const selected = this.selectedMonthFilter();
    if (selected === 'ALL') {
      return {
        monthLabel: 'Histórico Total',
        ordersCount: this.myOrders().length,
        grossSales: this.totalGrossSum(),
        gatewayFees: this.totalGatewayFees(),
        platformFees: this.myOrders().reduce((sum, o) => sum + (o.split?.platformFeeAmount || 0), 0),
        instructorEarnings: this.totalInstructorEarnings()
      };
    }
    const found = this.monthlySummaries().find(m => m.monthKey === selected);
    return found || {
      monthLabel: 'Sin datos',
      ordersCount: 0,
      grossSales: 0,
      gatewayFees: 0,
      platformFees: 0,
      instructorEarnings: 0
    };
  });
}
