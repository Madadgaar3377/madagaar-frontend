"use client";

export default function TestClient({ properties }) {
  return (
    <button onClick={() => console.log(properties.length)}>
      Click me
    </button>
  );
}
