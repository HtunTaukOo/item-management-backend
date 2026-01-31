import { getClientPromise } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function corsResponse(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: corsHeaders,
  });
}

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

export async function PUT(req, context) {
  const { id } = await context.params; // ✅ FIX
  const body = await req.json();

  const client = await getClientPromise();
  const db = client.db("wad-01");

  await db.collection("item").updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        itemName: body.itemName,
        itemCategory: body.itemCategory,
        itemPrice: Number(body.itemPrice),
        status: body.status,
      },
    }
  );

  return corsResponse({ message: "Item updated" });
}

export async function DELETE(req, context) {
  const { id } = await context.params; // ✅ FIX

  const client = await getClientPromise();
  const db = client.db("wad-01");

  await db.collection("item").deleteOne({
    _id: new ObjectId(id),
  });

  return corsResponse({ message: "Item deleted" });
}



