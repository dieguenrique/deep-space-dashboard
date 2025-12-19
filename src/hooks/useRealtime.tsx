import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const useRealtime = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "financeiro_registros" },
        () => {
          console.log("Realtime update: Finance");
          queryClient.invalidateQueries({ queryKey: ["transactions"] });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lembretes" },
        () => {
          console.log("Realtime update: Reminders");
          queryClient.invalidateQueries({ queryKey: ["reminders"] });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notas" },
        () => {
          console.log("Realtime update: Notes");
          queryClient.invalidateQueries({ queryKey: ["notes"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};
