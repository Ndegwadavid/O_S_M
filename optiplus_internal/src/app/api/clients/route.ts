import pool from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const firstName = url.searchParams.get("firstName");
  const lastName = url.searchParams.get("lastName");

  try {
    let query = "SELECT id, firstName, lastName, registrationNumber, phoneNumber, created_at FROM clients";
    const params: any[] = [];

    if (firstName || lastName) {
      query += " WHERE";
      if (firstName) {
        query += " (firstName LIKE ? OR lastName LIKE ?)";
        params.push(`%${firstName}%`, `%${firstName}%`);
      }
      if (lastName) {
        if (firstName) query += " OR";
        query += " lastName LIKE ?";
        params.push(`%${lastName}%`);
      }
    }

    query += " ORDER BY created_at DESC";

    const [rows] = await pool.query(query, params);
    return new Response(JSON.stringify(rows), { status: 200 });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch clients" }), { status: 500 });
  }
}

export async function POST(req: Request) {
  const clientData = await req.json();
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");

  try {
    // Get the last client ID to generate the next registration number
    const [lastRows] = await pool.query("SELECT MAX(id) as lastId FROM clients");
    const lastId = (lastRows as any)[0].lastId || 0;
    const newClientId = lastId + 1;
    const registrationNumber = `M/${year}/${month}/${newClientId}`;

    // Insert the new client
    const [result] = await pool.query(
      "INSERT INTO clients (firstName, lastName, dateOfBirth, phoneNumber, emailAddress, areaOfResidence, previousRx, servedBy, registrationNumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        clientData.firstName,
        clientData.lastName,
        clientData.dateOfBirth,
        clientData.phoneNumber,
        clientData.emailAddress || null, // Optional
        clientData.areaOfResidence,
        clientData.previousRx || null, // Optional
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