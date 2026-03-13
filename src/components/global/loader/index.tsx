import React from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

type LoaderProps = {
  state: boolean;
  className?: string;
  color?: string;
  children?: React.ReactNode;
};

export default function Loader({
  state,
  className,
  color,
  children,
}: LoaderProps) {
  return state ? (
    <div className={cn(className)}>
      <Spinner color={color} />
    </div>
  ) : (
    children
  );
}
