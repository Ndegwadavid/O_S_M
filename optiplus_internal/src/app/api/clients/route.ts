import pool from "@/lib/db";
import AfricasTalking from "africastalking";

// Initialize Africa's Talking
const africasTalking = AfricasTalking({
  apiKey: process.env.AFRICASTALKING_API_KEY,
  username: process.env.AFRICASTALKING_USERNAME,
});
const sms = africasTalking.SMS;

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

    // Send SMS with detailed logging
    const message = `Hello ${clientData.firstName}, thank you for visiting OptiPlus. Your reference number is ${registrationNumber}. Visit our website at optiplus.co.ke`;
    console.log("Sending SMS to:", clientData.phoneNumber);
    console.log("SMS message:", message);
    try {
      const smsResponse = await sms.send({
        to: [clientData.phoneNumber],
        message: message,
        from: "OptiPlus",
      });
      console.log("SMS response:", JSON.stringify(smsResponse, null, 2));
    } catch (smsError) {
      console.error("SMS sending failed:", smsError);
      // Don't fail the whole request, just log the SMS issue
    }

    return new Response(
      JSON.stringify({
        registrationNumber,
        id: (result as any).insertId,
        message: "Client registered successfully",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error registering client:", error);
    return new Response(
      JSON.stringify({ error: "Failed to save client", details: error.message }),
      { status: 500 }
    );
  }
}