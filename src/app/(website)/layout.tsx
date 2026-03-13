import React from "react";

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col py-10 px-10 xl:px-0 container">
      {children}
    </div>
  );
}
