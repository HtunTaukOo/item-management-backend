import { getClientPromise } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,PATCH,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export const dynamic = "force-dynamic";

/* GET profile */
export async function GET(req, context) {
  const { id } = await context.params;

  const client = await getClientPromise();
  const db = client.db("wad-01");

  const user = await db.collection("user").findOne({
    _id: new ObjectId(id),
  });

  return NextResponse.json(user, { headers: corsHeaders });
}

/* PATCH profile + image upload */
export async function PATCH(req, context) {
  const { id } = await context.params;

  const formData = await req.formData();

  const firstname = formData.get("firstname");
  const lastname = formData.get("lastname");
  const email = formData.get("email");
  const file = formData.get("image");

  let imagePath = null;

  /* ---- Handle image upload ---- */
  if (file && file.size > 0) {
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: "Only image files allowed" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split(".").pop();
    const filename = `${uuidv4()}.${ext}`; // encrypted name

    const uploadDir = path.join(process.cwd(), "public/uploads");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, buffer);

    imagePath = `/uploads/${filename}`; // public URL
  }

  /* ---- Update DB ---- */
  const client = await getClientPromise();
  const db = client.db("wad-01");

  const updateData = {
    firstname,
    lastname,
    email,
  };

  if (imagePath) {
    updateData.profileImage = imagePath;
  }

  await db.collection("user").updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
  );

  return NextResponse.json({ message: "Profile updated" }, { headers: corsHeaders });
}
