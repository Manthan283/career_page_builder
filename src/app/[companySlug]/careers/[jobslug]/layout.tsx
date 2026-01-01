export default function JobLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { jobSlug: string };
}) {
  return (
    <div key={params.jobSlug}>
      {children}
    </div>
  );
}

