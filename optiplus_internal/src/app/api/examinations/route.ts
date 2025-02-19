import pool from "@/lib/db";

export async function POST(req: Request) {
  const { clientId, prescription, clinicalHistory, registrationNumber } = await req.json();

  try {
    const [result] = await pool.query(
      "INSERT INTO examinations (client_id, registration_number, right_sphere, right_cylinder, right_axis, right_add, right_va, right_ipd, left_sphere, left_cylinder, left_axis, left_add, left_va, left_ipd, clinical_history, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())",
      [
        clientId,
        registrationNumber,
        prescription.rightSphere,
        prescription.rightCylinder,
        prescription.rightAxis,
        prescription.rightAdd,
        prescription.rightVA,
        prescription.rightIPD,
        prescription.leftSphere,
        prescription.leftCylinder,
        prescription.leftAxis,
        prescription.leftAdd,
        prescription.leftVA,
        prescription.leftIPD,
        clinicalHistory,
      ]
    );

    return new Response(JSON.stringify({ message: "Examination saved successfully" }), { status: 200 });
  } catch (error) {
    console.error("Error saving examination:", error);
    return new Response(JSON.stringify({ error: "Failed to save examination" }), { status: 500 });
  }
}