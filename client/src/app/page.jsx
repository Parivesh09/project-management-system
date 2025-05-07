"use client";
import Loader from "../components/Loader";
import { useGetCurrentUserQuery } from "../redux/services/api";
import HomePage from "./home/page";

export default function Home() {
  const { data: currentUser } = useGetCurrentUserQuery({});
  if (!currentUser) return <><Loader fullScreen /></>;
  return <HomePage />;
}
