import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

beforeEach(() => {
  window.localStorage.clear();
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => vi.unstubAllGlobals());

describe("Nexus AI Hub browser workspace", () => {
  it("renders the workspace and keeps API keys in local storage", async () => {
    render(<App />);
    expect(screen.getByText(/Bonjour,/)).toBeInTheDocument();
    expect(screen.getByText(/Une idée en tête/)).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: /Vault/ })[0]);
    const keyInput = screen.getByLabelText("Clé API OpenAI");
    fireEvent.change(keyInput, { target: { value: "sk-local-test-key" } });
    fireEvent.click(screen.getAllByRole("button", { name: "Enregistrer" })[0]);

    await waitFor(() => expect(JSON.parse(window.localStorage.getItem("nexus.keys") ?? "{}").openai).toBe("sk-local-test-key"));
    expect(screen.getByText(/Clé enregistrée localement/)).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("creates a local prompt and injects it without erasing the message draft", async () => {
    render(<App />);
    fireEvent.click(screen.getAllByRole("button", { name: /Prompts/ })[0]);
    fireEvent.change(screen.getByPlaceholderText("Ex. Brief de lancement"), { target: { value: "Résumé" } });
    fireEvent.change(screen.getByPlaceholderText("Rédigez une instruction réutilisable…"), { target: { value: "Résume les points clés." } });
    fireEvent.click(screen.getByRole("button", { name: /Enregistrer dans la bibliothèque/ }));

    expect(screen.getByText("Résumé")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Insérer dans le Chat/ }));
    const composer = screen.getByLabelText("Votre message") as HTMLTextAreaElement;
    await waitFor(() => expect(composer.value).toBe("Résume les points clés."));

    fireEvent.change(composer, { target: { value: "Contexte existant" } });
    fireEvent.click(screen.getAllByRole("button", { name: /Prompts/ })[0]);
    fireEvent.click(screen.getByRole("button", { name: /Insérer dans le Chat/ }));
    await waitFor(() => expect((screen.getByLabelText("Votre message") as HTMLTextAreaElement).value).toBe("Contexte existant\n\nRésume les points clés."));
  });

  it("does not fake an AI answer when no provider key exists", async () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText("Votre message"), { target: { value: "Test local sans clé" } });
    fireEvent.click(screen.getByLabelText("Envoyer le message"));
    await waitFor(() => expect(screen.getByText(/Tous les providers sélectionnés ont échoué/)).toBeInTheDocument());
    const saved = JSON.parse(window.localStorage.getItem("nexus.chat") ?? "[]");
    expect(saved.some((message: { content: string }) => message.content === "Test local sans clé")).toBe(true);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("opens the global model palette and filters providers/models", () => {
    render(<App />);
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    expect(screen.getByRole("dialog", { name: "Changer de modèle" })).toBeInTheDocument();
    const search = screen.getByPlaceholderText("Rechercher un provider ou un modèle…");
    fireEvent.change(search, { target: { value: "gemini" } });
    expect(screen.getByText("gemini-2.0-flash")).toBeInTheDocument();
    expect(within(screen.getByRole("dialog", { name: "Changer de modèle" })).queryByText("gpt-4o-mini")).not.toBeInTheDocument();
  });
});
