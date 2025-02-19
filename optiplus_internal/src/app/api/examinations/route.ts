import pool from "@/lib/db";

export async function POST(req: Request) {
  const { clientId, prescription, clinicalHistory, registrationNumber } = await req.json();

  try {
    const [result] = await pool.query(
      "INSERT INTO examinations (client_id, registration_number, right_sphere, right_cylinder, right_axis, right_add, right_va, right_ipd, left_sphere, left_cylinder, left_axis, left_add, left_va, left_ipd, clinical_history, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Completed Examination', NOW())",
      [
        clientId,
        registrationNumber,
        prescription.rightSphere || null,
        prescription.rightCylinder || null,
        prescription.rightAxis || null,
        prescription.rightAdd || null,
        prescription.rightVA || null,
        prescription.rightIPD || null,
        prescription.leftSphere || null,
        prescription.leftCylinder || null,
        prescription.leftAxis || null,
        prescription.leftAdd || null,
        prescription.leftVA || null,
        prescription.leftIPD || null,
        clinicalHistory || null,
      ]
    );

    // Optionally update the clients table to reflect status, but we'll handle it via examinations
    return new Response(JSON.stringify({ message: "Examination saved successfully" }), { status: 200 });
  } catch (error) {
    console.error("Error saving examination:", error);
    return new Response(JSON.stringify({ error: "Failed to save examination" }), { status: 500 });
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const clientId = url.searchParams.get("clientId");

  try {
    let query = "SELECT e.*, c.firstName, c.lastName, c.registrationNumber FROM examinations e JOIN clients c ON e.client_id = c.id";
    const params: any[] = [];

    if (clientId) {
      query += " WHERE e.client_id = ?";
      params.push(clientId);
    }

    const [rows] = await pool.query(query, params);
    return new Response(JSON.stringify(rows), { status: 200 });
  } catch (error) {
    console.error("Error fetching examinations:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch examinations" }), { status: 500 });
  }
}