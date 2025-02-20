import pool from "@/lib/db";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { balance, deliveryDate } = await req.json();
  const clientId = parseInt(params.id);

  try {
    const updates: string[] = [];
    const values: any[] = [];

    if (balance !== undefined) {
      updates.push("balance = ?");
      values.push(balance);
    }
    if (deliveryDate !== undefined) {
      updates.push("delivery_date = ?");
      values.push(deliveryDate);
    }

    if (updates.length === 0) {
      return new Response(JSON.stringify({ error: "No fields provided to update" }), { status: 400 });
    }

    const query = `UPDATE sales_orders SET ${updates.join(", ")} WHERE client_id = ?`;
    values.push(clientId);

    const [result] = await pool.query(query, values);

    if ((result as any).affectedRows === 0) {
      return new Response(JSON.stringify({ error: "No sales order found for this client" }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: "Update successful" }), { status: 200 });
  } catch (error) {
    console.error("Error updating sales order:", error);
    return new Response(JSON.stringify({ error: "Failed to update sales order" }), { status: 500 });
  }
}