import { NextResponse } from "next/server";
import {
  getRecommendations,
  handleRecommendationApiError
} from "@/features/recommendations/application/recommendation-service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const recommendations = await getRecommendations(searchParams);
    return NextResponse.json(recommendations);
  } catch (error) {
    return handleRecommendationApiError(error);
  }
}
