import { createTranslator } from "@/features/i18n/application/get-translator";
import { defaultLocale, type Locale } from "@/features/i18n/domain/config";
import type { StorefrontOrder } from "@/types/order";
import { getSiteUrl } from "@/lib/storefront/site-url";
import { formatPrice } from "@/lib/utils";
import { escapeHtml, renderEmailLayout, renderPlainLayout } from "@/features/email/infrastructure/templates/layout";

type TemplateContext = {
  order: StorefrontOrder;
  storeName: string;
  locale?: Locale;
};

function formatShippingAddress(order: StorefrontOrder) {
  return [order.shippingAddress, order.township].filter(Boolean).join(", ");
}

function renderOrderItemsHtml(order: StorefrontOrder) {
  return order.items
    .map(
      (item) => `<tr>
        <td style="padding:12px 0;border-bottom:1px solid #e7e2dc;font-size:14px;">${escapeHtml(item.productName)}<br /><span style="color:#7a746c;font-size:12px;">${escapeHtml(item.size)} / ${escapeHtml(item.color)} × ${item.quantity}</span></td>
        <td style="padding:12px 0;border-bottom:1px solid #e7e2dc;font-size:14px;text-align:right;white-space:nowrap;">${escapeHtml(formatPrice(item.lineTotalMmk))}</td>
      </tr>`
    )
    .join("");
}

function renderOrderSummaryPlain(order: StorefrontOrder, labels: { subtotal: string; shipping: string; total: string }) {
  return [
    ...order.items.map(
      (item) => `${item.productName} (${item.size}/${item.color}) × ${item.quantity} — ${formatPrice(item.lineTotalMmk)}`
    ),
    "",
    `${labels.subtotal}: ${formatPrice(order.subtotalMmk)}`,
    `${labels.shipping}: ${formatPrice(order.shippingMmk)}`,
    `${labels.total}: ${formatPrice(order.totalMmk)}`
  ];
}

export function renderOrderConfirmationEmail({ order, storeName, locale = defaultLocale }: TemplateContext) {
  const { t } = createTranslator(locale);
  const orderUrl = `${getSiteUrl()}/checkout/confirmation/${order.id}`;
  const shippingAddress = formatShippingAddress(order);

  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">${escapeHtml(t("email.orderConfirmation.greeting", { name: order.customer }))}</p>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;">${escapeHtml(t("email.orderConfirmation.body"))}</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px;">
      <tr><td style="padding:8px 0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#7a746c;">${escapeHtml(t("email.orderConfirmation.orderNumber"))}</td><td style="padding:8px 0;font-size:14px;text-align:right;">${escapeHtml(order.id)}</td></tr>
      <tr><td style="padding:8px 0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#7a746c;">${escapeHtml(t("email.orderConfirmation.shippingAddress"))}</td><td style="padding:8px 0;font-size:14px;text-align:right;">${escapeHtml(shippingAddress)}</td></tr>
    </table>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${renderOrderItemsHtml(order)}</table>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:16px;">
      <tr><td style="padding:8px 0;font-size:14px;color:#7a746c;">${escapeHtml(t("email.orderConfirmation.subtotal"))}</td><td style="padding:8px 0;font-size:14px;text-align:right;">${escapeHtml(formatPrice(order.subtotalMmk))}</td></tr>
      <tr><td style="padding:8px 0;font-size:14px;color:#7a746c;">${escapeHtml(t("email.orderConfirmation.shippingLabel"))}</td><td style="padding:8px 0;font-size:14px;text-align:right;">${escapeHtml(formatPrice(order.shippingMmk))}</td></tr>
      <tr><td style="padding:12px 0 0;font-size:16px;font-weight:600;border-top:1px solid #e7e2dc;">${escapeHtml(t("email.orderConfirmation.total"))}</td><td style="padding:12px 0 0;font-size:16px;font-weight:600;text-align:right;border-top:1px solid #e7e2dc;">${escapeHtml(formatPrice(order.totalMmk))}</td></tr>
    </table>`;

  const subject = t("email.orderConfirmation.subject", { orderId: order.id, storeName });
  const title = t("email.orderConfirmation.title");
  const html = renderEmailLayout({
    storeName,
    preview: t("email.orderConfirmation.preview", { orderId: order.id }),
    title,
    bodyHtml,
    ctaLabel: t("email.orderConfirmation.viewOrder"),
    ctaHref: orderUrl
  });
  const text = renderPlainLayout({
    title,
    lines: [
      t("email.orderConfirmation.greeting", { name: order.customer }),
      t("email.orderConfirmation.body"),
      `${t("email.orderConfirmation.orderNumber")}: ${order.id}`,
      `${t("email.orderConfirmation.shippingAddress")}: ${shippingAddress}`,
      "",
      ...renderOrderSummaryPlain(order, {
        subtotal: t("email.orderConfirmation.subtotal"),
        shipping: t("email.orderConfirmation.shippingLabel"),
        total: t("email.orderConfirmation.total")
      })
    ],
    ctaLabel: t("email.orderConfirmation.viewOrder"),
    ctaHref: orderUrl
  });

  return { subject, html, text };
}

export function renderPaymentSuccessEmail({ order, storeName, locale = defaultLocale }: TemplateContext) {
  const { t } = createTranslator(locale);
  const orderUrl = `${getSiteUrl()}/checkout/confirmation/${order.id}`;

  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">${escapeHtml(t("email.paymentSuccess.greeting", { name: order.customer }))}</p>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;">${escapeHtml(t("email.paymentSuccess.body"))}</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr><td style="padding:8px 0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#7a746c;">${escapeHtml(t("email.paymentSuccess.orderNumber"))}</td><td style="padding:8px 0;font-size:14px;text-align:right;">${escapeHtml(order.id)}</td></tr>
      <tr><td style="padding:8px 0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#7a746c;">${escapeHtml(t("email.paymentSuccess.amountPaid"))}</td><td style="padding:8px 0;font-size:14px;text-align:right;">${escapeHtml(formatPrice(order.totalMmk))}</td></tr>
      <tr><td style="padding:8px 0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#7a746c;">${escapeHtml(t("email.paymentSuccess.paymentStatus"))}</td><td style="padding:8px 0;font-size:14px;text-align:right;">${escapeHtml(t("checkout.paymentStatusPaid"))}</td></tr>
    </table>`;

  const subject = t("email.paymentSuccess.subject", { orderId: order.id, storeName });
  const title = t("email.paymentSuccess.title");
  const html = renderEmailLayout({
    storeName,
    preview: t("email.paymentSuccess.preview", { orderId: order.id }),
    title,
    bodyHtml,
    ctaLabel: t("email.paymentSuccess.viewOrder"),
    ctaHref: orderUrl
  });
  const text = renderPlainLayout({
    title,
    lines: [
      t("email.paymentSuccess.greeting", { name: order.customer }),
      t("email.paymentSuccess.body"),
      `${t("email.paymentSuccess.orderNumber")}: ${order.id}`,
      `${t("email.paymentSuccess.amountPaid")}: ${formatPrice(order.totalMmk)}`,
      `${t("email.paymentSuccess.paymentStatus")}: ${t("checkout.paymentStatusPaid")}`
    ],
    ctaLabel: t("email.paymentSuccess.viewOrder"),
    ctaHref: orderUrl
  });

  return { subject, html, text };
}

export function renderShippingEmail({ order, storeName, locale = defaultLocale }: TemplateContext) {
  const { t } = createTranslator(locale);
  const orderUrl = `${getSiteUrl()}/checkout/confirmation/${order.id}`;
  const carrier = order.carrier ?? "";
  const trackingNumber = order.trackingNumber ?? "";

  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">${escapeHtml(t("email.shipping.greeting", { name: order.customer }))}</p>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;">${escapeHtml(t("email.shipping.body"))}</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr><td style="padding:8px 0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#7a746c;">${escapeHtml(t("email.shipping.orderNumber"))}</td><td style="padding:8px 0;font-size:14px;text-align:right;">${escapeHtml(order.id)}</td></tr>
      <tr><td style="padding:8px 0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#7a746c;">${escapeHtml(t("email.shipping.carrier"))}</td><td style="padding:8px 0;font-size:14px;text-align:right;">${escapeHtml(carrier)}</td></tr>
      <tr><td style="padding:8px 0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#7a746c;">${escapeHtml(t("email.shipping.trackingNumber"))}</td><td style="padding:8px 0;font-size:14px;text-align:right;">${escapeHtml(trackingNumber)}</td></tr>
    </table>`;

  const subject = t("email.shipping.subject", { orderId: order.id, storeName });
  const title = t("email.shipping.title");
  const html = renderEmailLayout({
    storeName,
    preview: t("email.shipping.preview", { orderId: order.id }),
    title,
    bodyHtml,
    ctaLabel: t("email.shipping.viewOrder"),
    ctaHref: orderUrl
  });
  const text = renderPlainLayout({
    title,
    lines: [
      t("email.shipping.greeting", { name: order.customer }),
      t("email.shipping.body"),
      `${t("email.shipping.orderNumber")}: ${order.id}`,
      `${t("email.shipping.carrier")}: ${carrier}`,
      `${t("email.shipping.trackingNumber")}: ${trackingNumber}`
    ],
    ctaLabel: t("email.shipping.viewOrder"),
    ctaHref: orderUrl
  });

  return { subject, html, text };
}
