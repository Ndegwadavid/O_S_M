import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { generateRegistrationNumber } from "@/lib/utils";
import { getServerSession } from "next-auth/next";

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      phoneNumber,
      emailAddress,
      areaOfResidence,
      previousRx,
      servedBy,
    } = await req.json();
    
    // Insert into MySQL database
    const result = await query(
      `INSERT INTO clients 
       (first_name, last_name, date_of_birth, phone_number, email_address, 
        area_of_residence, previous_rx, served_by, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        firstName,
        lastName,
        dateOfBirth,
        phoneNumber,
        emailAddress || null,
        areaOfResidence,
        previousRx || null,
        servedBy,
      ]
    ) as any;
    
    const clientId = result.insertId;
    const registrationNumber = generateRegistrationNumber(clientId);
    
    // Update the registration number
    await query(
      "UPDATE clients SET registration_number = ? WHERE id = ?",
      [registrationNumber, clientId]
    );
    
    return NextResponse.json({ 
      success: true,
      registrationNumber,
      clientId
    });
  } catch (error) {
    console.error("Error registering client:", error);
    return NextResponse.json(
      { error: "Failed to register client" },
      { status: 500 }
    );
  }
}