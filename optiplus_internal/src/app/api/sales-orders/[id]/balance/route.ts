import pool from "@/lib/db";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { balance } = await req.json();
  const clientId = parseInt(params.id);

  try {
    await pool.query(
      "UPDATE sales_orders SET balance = ? WHERE client_id = ?",
      [balance, clientId]
    );
    return new Response(JSON.stringify({ message: "Balance updated" }), { status: 200 });
  } catch (error) {
    console.error("Error updating balance:", error);
    return new Response(JSON.stringify({ error: "Failed to update balance" }), { status: 500 });
  }
}