import pool from "@/lib/db";

export async function POST(req: Request) {
  const clientData = await req.json();
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");

  try {
    const [lastRows] = await pool.query("SELECT MAX(id) as lastId FROM clients");
    const lastId = (lastRows as any)[0].lastId || 0;
    const newClientId = lastId + 1;
    const registrationNumber = `M/${year}/${month}/${newClientId}`;

    const [result] = await pool.query(
      "INSERT INTO clients (firstName, lastName, dateOfBirth, phoneNumber, emailAddress, areaOfResidence, previousRx, servedBy, registrationNumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        clientData.firstName,
        clientData.lastName,
        clientData.dateOfBirth,
        clientData.phoneNumber,
        clientData.emailAddress || null,
        clientData.areaOfResidence,
        clientData.previousRx || null,
        clientData.servedBy,
        registrationNumber,
      ]
    );

    return new Response(JSON.stringify({ registrationNumber, id: (result as any).insertId }), { status: 200 });
  } catch (error) {
    console.error("Error registering client:", error);
    return new Response(JSON.stringify({ error: "Failed to save client" }), { status: 500 });
  }
}

export async function GET() {
  try {
    const [rows] = await pool.query("SELECT id, firstName, lastName, registrationNumber, phoneNumber, created_at FROM clients ORDER BY created_at DESC");
    return new Response(JSON.stringify(rows), { status: 200 });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch clients" }), { status: 500 });
  }
}