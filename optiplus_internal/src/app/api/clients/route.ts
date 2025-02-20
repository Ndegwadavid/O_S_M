import pool from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const firstName = url.searchParams.get("firstName");
  const lastName = url.searchParams.get("lastName");
  const id = url.searchParams.get("id");

  try {
    let query = "SELECT * FROM clients";
    const params: any[] = [];

    if (id) {
      query += " WHERE id = ?";
      params.push(id);
    } else if (firstName || lastName) {
      query += " WHERE";
      let conditions = [];
      if (firstName) {
        conditions.push("firstName LIKE ?");
        conditions.push("lastName LIKE ?");
        params.push(`%${firstName}%`, `%${firstName}%`);
      }
      if (lastName) {
        conditions.push("lastName LIKE ?");
        params.push(`%${lastName}%`);
      }
      query += " " + conditions.join(" OR ");
    }

    query += " ORDER BY created_at DESC";

    const [rows] = await pool.query(query, params);
    if (rows.length === 0 && id) {
      return new Response(JSON.stringify({ error: `No client found with id ${id}` }), { status: 404 });
    }
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
    const [lastRows] = await pool.query("SELECT MAX(id) as lastId FROM clients");
    const lastId = (lastRows as any)[0].lastId || 0;
    const newClientId = lastId + 1;
    const registrationNumber = `M/${year}/${month}/${newClientId}`;

    const [result] = await pool.query(
      "INSERT INTO clients (firstName, lastName, dateOfBirth, phoneNumber, emailAddress, areaOfResidence, previousRx, servedBy, registrationNumber, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())",
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

    return new Response(JSON.stringify({ 
      registrationNumber, 
      id: (result as any).insertId, 
      message: "Client registered successfully" 
    }), { status: 200 });
  } catch (error) {
    console.error("Error registering client:", error);
    return new Response(JSON.stringify({ error: "Failed to save client" }), { status: 500 });
  }
}