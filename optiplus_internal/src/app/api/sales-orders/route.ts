import pool from "@/lib/db";

export async function POST(req: Request) {
  const { clientId, sale, registrationNumber } = await req.json();
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().split("T")[0]; // YYYY-MM-DD

  try {
    const [lastRows] = await pool.query("SELECT MAX(id) as lastId FROM sales_orders");
    const lastId = (lastRows as any)[0].lastId || 0;
    const newSaleId = lastId + 1;
    const referenceNumber = `opt/M/${String(newSaleId).padStart(3, "0")}`;

    const [result] = await pool.query(
      "INSERT INTO sales_orders (client_id, registration_number, frames_brand, frames_model, frames_color, frames_quantity, frames_amount, lenses_brand, lenses_model, lenses_color, lenses_quantity, lenses_amount, total_amount, advance_paid, balance, fitting_instructions, order_booked_by, delivery_date, reference_number, collection_status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())",
      [
        clientId,
        registrationNumber,
        sale.framesBrand || null,
        sale.framesModel || null,
        sale.framesColor || null,
        sale.framesQuantity || 1,
        sale.framesAmount || 0,
        sale.lensesBrand || null,
        sale.lensesModel || null,
        sale.lensesColor || null,
        sale.lensesQuantity || 1,
        sale.lensesAmount || 0,
        sale.totalAmount || 0,
        sale.advancePaid || 0,
        sale.balance || 0,
        sale.fittingInstructions || null,
        sale.orderBookedBy || null,
        sale.deliveryDate || formattedDate, // Default to current date
        referenceNumber,
        "Pending Collection",
      ]
    );

    return new Response(JSON.stringify({ message: "Sales order saved successfully", id: (result as any).insertId, referenceNumber }), { status: 200 });
  } catch (error) {
    console.error("Error saving sales order:", error);
    return new Response(JSON.stringify({ error: "Failed to save sales order" }), { status: 500 });
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const clientId = url.searchParams.get("clientId");

  try {
    let query = "SELECT * FROM sales_orders WHERE client_id = ?";
    const [rows] = await pool.query(query, [clientId]);
    console.log("Sales orders fetched:", rows); // Debug log
    return new Response(JSON.stringify(rows), { status: 200 });
  } catch (error) {
    console.error("Error fetching sales orders:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch sales orders" }), { status: 500 });
  }
}