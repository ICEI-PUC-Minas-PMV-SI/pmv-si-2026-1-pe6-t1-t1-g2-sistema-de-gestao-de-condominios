import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useProfileModal } from "./useProfileModal";

describe("useProfileModal", () => {
	it("abre, fecha e alterna estado do modal", () => {
		const { result } = renderHook(() => useProfileModal());

		expect(result.current.isOpen).toBe(false);

		act(() => result.current.open());
		expect(result.current.isOpen).toBe(true);

		act(() => result.current.toggle());
		expect(result.current.isOpen).toBe(false);

		act(() => result.current.close());
		expect(result.current.isOpen).toBe(false);
	});
});
