import { getClientPromise } from "@/lib/mongodb";
import { corsHeaders, corsResponse } from "../_utils/cors";

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");
    const skip = (page - 1) * limit;

    const client = await getClientPromise();
    const db = client.db("wad-01");

    const items = await db
      .collection("item")
      .find({})
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await db.collection("item").countDocuments();

    return corsResponse({ data: items, total, page, limit });
  } catch (err) {
    return corsResponse(
      { error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    const client = await getClientPromise();
    const db = client.db("wad-01");

    const result = await db.collection("item").insertOne({
      itemName: body.itemName,
      itemCategory: body.itemCategory,
      itemPrice: Number(body.itemPrice),
      status: body.status || "ACTIVE",
    });

    return corsResponse(
      { id: result.insertedId },
      { status: 201 }
    );
  } catch (err) {
    return corsResponse(
      { error: err.message },
      { status: 500 }
    );
  }
}


