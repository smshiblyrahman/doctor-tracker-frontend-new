import { act, fireEvent, render, screen } from "@testing-library/react";
import { SearchInput } from "@/components/shared/SearchInput";

describe("SearchInput", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("debounces typing into a single onChange call", () => {
    const onChange = jest.fn();
    render(<SearchInput label="Search doctors" value="" onChange={onChange} />);
    const input = screen.getByRole("searchbox", { name: "Search doctors" });

    fireEvent.change(input, { target: { value: "c" } });
    fireEvent.change(input, { target: { value: "ca" } });
    fireEvent.change(input, { target: { value: "card " } });
    act(() => jest.advanceTimersByTime(299));
    expect(onChange).not.toHaveBeenCalled();

    act(() => jest.advanceTimersByTime(1));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("card");
  });

  it("clears with the clear button and follows external value changes", () => {
    const onChange = jest.fn();
    const { rerender } = render(<SearchInput label="Search" value="sarah" onChange={onChange} />);
    expect(screen.getByRole("searchbox")).toHaveValue("sarah");

    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
    act(() => jest.advanceTimersByTime(300));
    expect(onChange).toHaveBeenLastCalledWith("");

    rerender(<SearchInput label="Search" value="john" onChange={onChange} />);
    expect(screen.getByRole("searchbox")).toHaveValue("john");
  });
});
