import type { Route } from "./+types/home";
import Register from "./register";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "GTrac" },
    { name: "description", content: "Welcome to Game Tracker!" },
  ];
}

export default function Home() {
  return <Register />;
}
