import { internalMutationGeneric } from "convex/server";
import { v } from "convex/values";
import { Resend } from "@convex-dev/resend";
import { components } from "./_generated/api";

const isTestMode = process.env.RESEND_TEST_MODE !== "false";

const resend = new Resend(components.resend, {
  testMode: isTestMode
});

const fromAddress = isTestMode
  ? process.env.RESEND_FROM || "Egg Orderer <onboarding@resend.dev>"
  : process.env.RESEND_FROM || "Egg Orderer <no-reply@example.com>";

const normalizeRecipient = (email: string) => {
  if (!email) return null;
  if (!isTestMode) return email;
  if (email.endsWith("@resend.dev")) return email;
  const safe = email.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 40) || "user";
  return `delivered+${safe}@resend.dev`;
};

export const sendOrderPlaced = internalMutationGeneric({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) return;
    const user = await ctx.db.get(order.userId);
    if (!user?.email) return;
    const to = normalizeRecipient(user.email);
    if (!to) return;

    console.log(user.email);
    

    await resend.sendEmail(ctx, {
      from: fromAddress,
      to,
      subject: "Your eggs are queued",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5;">
          <h2 style="margin:0 0 8px;">Order received 🥚</h2>
          <p style="margin:0 0 12px;">Hi ${user.name},</p>
          <p style="margin:0 0 12px;">We have ${order.quantity} ${order.eggType} egg(s) in the queue.</p>
          ${isTestMode ? `<p style="margin:0 0 12px;">Test mode recipient: ${to}</p>` : ""}
          <p style="margin:0;">We will ping you when they are ready.</p>
        </div>
      `
    });
  }
});

export const sendOrderReady = internalMutationGeneric({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order || !order.readyAt) return;
    const user = await ctx.db.get(order.userId);
    if (!user?.email) return;
    const to = normalizeRecipient(user.email);
    if (!to) return;

    await resend.sendEmail(ctx, {
      from: fromAddress,
      to,
      subject: "Your eggs are ready",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5;">
          <h2 style="margin:0 0 8px;">Eggs ready 🍳</h2>
          <p style="margin:0 0 12px;">Hi ${user.name},</p>
          <p style="margin:0 0 12px;">Your ${order.quantity} ${order.eggType} egg(s) are ready to serve.</p>
          ${isTestMode ? `<p style="margin:0 0 12px;">Test mode recipient: ${to}</p>` : ""}
          <p style="margin:0;">Enjoy your breakfast!</p>
        </div>
      `
    });
  }
});
