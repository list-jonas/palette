import { Suspense } from "react";
import PageContent from "@/components/PageContent"; // Adjust path if necessary

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  );
}
