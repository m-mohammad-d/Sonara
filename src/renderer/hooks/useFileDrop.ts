import { useEffect, useRef, useState, useCallback } from 'react';
import { processDroppedFiles } from '../services/fileImportService';

interface UseFileDropResult {
  isDragging: boolean;
  isProcessing: boolean;
}

/**
 * Hook to manage window-level drag-and-drop lifecycle for local audio files.
 * Uses a depth counter to prevent flickering when the pointer traverses nested child DOM elements.
 */
export function useFileDrop(): UseFileDropResult {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const dragCounterRef = useRef<number>(0);

  const isFileDrag = useCallback((event: DragEvent): boolean => {
    if (!event.dataTransfer) return false;
    const types = event.dataTransfer.types;
    // Chromium sets types to include 'Files' when native OS files are dragged
    return types && Array.from(types).includes('Files');
  }, []);

  const resetDragState = useCallback(() => {
    dragCounterRef.current = 0;
    setIsDragging(false);
  }, []);

  useEffect(() => {
    const handleDragEnter = (event: DragEvent) => {
      if (!isFileDrag(event)) return;

      event.preventDefault();
      dragCounterRef.current += 1;

      if (dragCounterRef.current === 1) {
        setIsDragging(true);
      }
    };

    const handleDragOver = (event: DragEvent) => {
      if (!isFileDrag(event)) return;

      event.preventDefault();
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'copy';
      }

      if (dragCounterRef.current > 0 && !isDragging) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (event: DragEvent) => {
      if (!isFileDrag(event)) return;

      event.preventDefault();
      dragCounterRef.current -= 1;

      if (dragCounterRef.current <= 0) {
        resetDragState();
      }
    };

    const handleDrop = async (event: DragEvent) => {
      if (!isFileDrag(event)) return;

      event.preventDefault();
      event.stopPropagation();

      resetDragState();

      const files = event.dataTransfer?.files;
      if (files && files.length > 0) {
        setIsProcessing(true);
        try {
          await processDroppedFiles(files);
        } finally {
          setIsProcessing(false);
        }
      }
    };

    const handleDragEnd = () => {
      resetDragState();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        resetDragState();
      }
    };

    const handleWindowBlur = () => {
      resetDragState();
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);
    window.addEventListener('dragend', handleDragEnd);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
      window.removeEventListener('dragend', handleDragEnd);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isFileDrag, isDragging, resetDragState]);

  return { isDragging, isProcessing };
}
