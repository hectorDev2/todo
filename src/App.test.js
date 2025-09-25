import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";

test("puede agregar una tarea", () => {
  render(<App />);
  const input = screen.getByPlaceholderText(/escribe una tarea/i);
  const button = screen.getByRole("button", { name: /agregar/i });
  expect(button).toBeDisabled();
  fireEvent.change(input, { target: { value: "Primera tarea" } });
  expect(button).not.toBeDisabled();
  fireEvent.click(button);
  expect(screen.getByText("Primera tarea")).toBeInTheDocument();
});
