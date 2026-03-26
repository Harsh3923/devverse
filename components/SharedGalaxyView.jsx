"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import SharedGalaxyScene from "./SharedGalaxyScene";

export default function SharedGalaxyView({ initialContributors, galaxyId }) {
  const [contributors, setContributors] = useState(initialContributors);
  const newIds = useRef(new Set());

  useEffect(() => {
    const channel = supabase
      .channel(`galaxy-${galaxyId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "galaxy_contributors",
          filter: `galaxy_id=eq.${galaxyId}`,
        },
        (payload) => {
          const newRow = payload.new;
          newIds.current.add(newRow.id);
          setContributors((prev) => [...prev, newRow]);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [galaxyId]);

  return (
    <SharedGalaxyScene
      contributors={contributors}
      newIds={new Set(newIds.current)}
    />
  );
}
