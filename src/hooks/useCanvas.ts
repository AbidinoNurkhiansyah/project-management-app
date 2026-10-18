"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { getFirebaseFirestore } from "@/lib/firebase/client";
import { useAuth } from "@/context/AuthContext";
import { BoardCanvasData, BoardDoc } from "@/types/boards";
import { validateCanvasPayloadSize } from "@/lib/canvas-validator";

const DEFAULT_CANVAS: BoardCanvasData = {
  nodes: [
    {
      id: "node-1",
      type: "taskNode",
      position: { x: 200, y: 150 },
      data: { title: "Architecture & Data Contracts", priority: "HIGH" },
    },
    {
      id: "node-2",
      type: "noteNode",
      position: { x: 480, y: 150 },
      data: { text: "Remember: Direct PUT upload to Cloudflare R2 avoids egress fees." },
    },
  ],
  edges: [{ id: "edge-1", source: "node-1", target: "node-2" }],
  viewport: { x: 0, y: 0, zoom: 1 },
};

export function useCanvas(projectId: string | null) {
  const { user } = useAuth();
  const [boardId, setBoardId] = useState<string | null>(null);
  const [canvasData, setCanvasData] = useState<BoardCanvasData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user || !projectId) {
      setCanvasData(null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    async function loadOrCreateBoard() {
      try {
        const db = getFirebaseFirestore();
        const q = query(
          collection(db, "boards"),
          where("projectId", "==", projectId),
          where("userId", "==", user!.uid),
          where("type", "==", "FLOWCHART")
        );

        const snap = await getDocs(q);
        if (!isMounted) return;

        if (!snap.empty) {
          const docSnap = snap.docs[0];
          const data = docSnap.data() as BoardDoc;
          setBoardId(docSnap.id);
          setCanvasData(data.canvasData || DEFAULT_CANVAS);
        } else {
          // Initialize flowchart board in Firestore
          const now = new Date().toISOString();
          const docRef = await addDoc(collection(db, "boards"), {
            userId: user!.uid,
            projectId,
            title: "Project Whiteboard",
            type: "FLOWCHART",
            canvasData: DEFAULT_CANVAS,
            createdAt: now,
            updatedAt: now,
          });
          if (isMounted) {
            setBoardId(docRef.id);
            setCanvasData(DEFAULT_CANVAS);
          }
        }
      } catch (err: unknown) {
        console.error("Failed to load canvas board:", err);
        if (isMounted) setCanvasData(DEFAULT_CANVAS);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadOrCreateBoard();
    return () => {
      isMounted = false;
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [user, projectId]);

  const saveCanvas = useCallback(
    (data: BoardCanvasData) => {
      setCanvasData(data);
      if (!validateCanvasPayloadSize(data)) {
        setSaveStatus("error");
        console.error("Canvas payload exceeds 800 KB safeguard limit");
        return;
      }

      setSaveStatus("saving");
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

      debounceTimerRef.current = setTimeout(async () => {
        if (!boardId || !user) return;
        try {
          const db = getFirebaseFirestore();
          await updateDoc(doc(db, "boards", boardId), {
            canvasData: data,
            updatedAt: new Date().toISOString(),
          });
          setSaveStatus("saved");
        } catch (err: unknown) {
          console.error("Failed to persist canvas data:", err);
          setSaveStatus("error");
        }
      }, 1000);
    },
    [boardId, user]
  );

  return {
    canvasData,
    loading,
    saveStatus,
    saveCanvas,
  };
}
