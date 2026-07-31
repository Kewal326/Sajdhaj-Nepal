import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

type OrderItem = {
  product_name: string
  quantity: number
  price: number
}

export async function POST(req: NextRequest) {
  const { orderId, customerName, customerPhone, items, total } = await req.json()

  const itemRows = (items as OrderItem[])
    .map(i => `<tr>
      <td style="padding:6px 8px;border-bottom:1px solid #f0f0f0">${i.product_name}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #f0f0f0;text-align:center">${i.quantity}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #f0f0f0;text-align:right">NPR ${(i.price * i.quantity).toLocaleString()}</td>
    </tr>`)
    .join('')

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#1a1a1a">
      <h2 style="color:#7F2E5D;margin-bottom:4px">New Order — सजधज Nepal</h2>
      <p style="color:#666;font-size:13px;margin-top:0">Order #${orderId?.slice(0, 8)?.toUpperCase()}</p>

      <table style="width:100%;border-collapse:collapse;margin:16px 0;background:#fafafa;border-radius:8px;overflow:hidden">
        <tr><td style="padding:10px 8px;font-weight:600;width:40%">Customer</td><td style="padding:10px 8px">${customerName}</td></tr>
        <tr><td style="padding:10px 8px;font-weight:600;background:#f5f5f5">Phone</td><td style="padding:10px 8px;background:#f5f5f5">${customerPhone}</td></tr>
        <tr><td style="padding:10px 8px;font-weight:600">Payment</td><td style="padding:10px 8px">Cash on delivery</td></tr>
      </table>

      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <thead>
          <tr style="background:#7F2E5D;color:white">
            <th style="padding:8px;text-align:left;font-weight:500">Item</th>
            <th style="padding:8px;text-align:center;font-weight:500">Qty</th>
            <th style="padding:8px;text-align:right;font-weight:500">Amount</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:10px 8px;font-weight:700;text-align:right">Total</td>
            <td style="padding:10px 8px;font-weight:700;text-align:right;color:#7F2E5D">NPR ${total.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>

      <p style="font-size:12px;color:#999;margin-top:24px">Call the customer to confirm delivery details.</p>
    </div>
  `

  const resend = new Resend(process.env.RESEND_API_KEY)
  const TO = process.env.NOTIFY_EMAIL!

  try {
    await resend.emails.send({
      from: 'Sajdhaj Nepal <onboarding@resend.dev>',
      to: TO,
      subject: `New order — NPR ${total.toLocaleString()} — ${customerPhone}`,
      html,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Resend error:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
