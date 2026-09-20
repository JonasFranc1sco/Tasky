import { Redirect } from "expo-router";
import "../global.css";

export default function Root() {
  return <Redirect href="/login" />;
}
