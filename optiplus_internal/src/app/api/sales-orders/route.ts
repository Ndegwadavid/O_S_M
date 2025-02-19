import pool from "@/lib/db";

export async function POST(req: Request) {
  const { clientId, sale, registrationNumber } = await req.json();

  try {
    const [result] = await pool.query(
      "INSERT INTO sales_orders (client_id, registration_number, frames_brand, frames_model, frames_color, frames_quantity, frames_amount, lenses_brand, lenses_model, lenses_color, lenses_quantity, lenses_amount, total_amount, advance_paid, balance, fitting_instructions, order_booked_by, delivery_date, reference_number, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())",
      [
        clientId,
        registrationNumber,
        sale.framesBrand,
        sale.framesModel,
        sale.framesColor,
        sale.framesQuantity,
        sale.framesAmount,
        sale.lensesBrand,
        sale.lensesModel,
        sale.lensesColor,
        sale.lensesQuantity,
        sale.lensesAmount,
        sale.totalAmount,
        sale.advancePaid,
        sale.balance,
        sale.fittingInstructions,
        sale.orderBookedBy,
        sale.deliveryDate,
        sale.referenceNumber,
      ]
    );

    return new Response(JSON.stringify({ message: "Sales order saved successfully" }), { status: 200 });
  } catch (error) {
    console.error("Error saving sales order:", error);
    return new Response(JSON.stringify({ error: "Failed to save sales order" }), { status: 500 });
  }
}