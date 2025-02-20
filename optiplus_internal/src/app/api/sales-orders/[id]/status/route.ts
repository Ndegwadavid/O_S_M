import pool from "@/lib/db";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { collectionStatus } = await req.json();
  const clientId = parseInt(params.id);

  try {
    const [result] = await pool.query(
      "UPDATE sales_orders SET collection_status = ? WHERE client_id = ?",
      [collectionStatus, clientId]
    );

    if ((result as any).affectedRows === 0) {
      return new Response(JSON.stringify({ error: "No sales order found for this client" }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: "Collection status updated successfully" }), { status: 200 });
  } catch (error) {
    console.error("Error updating collection status:", error);
    return new Response(JSON.stringify({ error: "Failed to update collection status" }), { status: 500 });
  }
}