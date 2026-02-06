import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";

export async function GET(req, { params }) {
  const { id } = params;

  try {
    const client = await getClientPromise();
    const db = client.db("wad-01");

    const user = await db.collection("user").findOne({ _id: new ObjectId(id) });

    return NextResponse.json(user, { headers: corsHeaders });
  } catch (err) {
    return NextResponse.json(
      { message: err.toString() },
      { status: 400, headers: corsHeaders }
    );
  }
}

export async function PATCH(req, { params }) {
  const { id } = params;
  const data = await req.json();

  const updateFields = {};

  if (data.username) updateFields.username = data.username;
  if (data.email) updateFields.email = data.email;
  if (data.firstname) updateFields.firstname = data.firstname;
  if (data.lastname) updateFields.lastname = data.lastname;
  if (data.status) updateFields.status = data.status;

  if (data.password) {
    updateFields.password = await bcrypt.hash(data.password, 10);
  }

  try {
    const client = await getClientPromise();
    const db = client.db("wad-01");

    const result = await db
      .collection("user")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateFields });

    return NextResponse.json(result, { headers: corsHeaders });
  } catch (err) {
    return NextResponse.json(
      { message: err.toString() },
      { status: 400, headers: corsHeaders }
    );
  }
}
export async function DELETE(req, { params }) {
  const { id } = params;

  try {
    const client = await getClientPromise();
    const db = client.db("wad-01");

    const result = await db
      .collection("user")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: "DELETED" } }
      );

    return NextResponse.json(result, { headers: corsHeaders });
  } catch (err) {
    return NextResponse.json(
      { message: err.toString() },
      { status: 400, headers: corsHeaders }
    );
  }
}




