/** @jest-environment jsdom */
import { render } from '@testing-library/react';
import RememberRoom from '@/app/[room_id]/_components/RememberRoom';

describe('RememberRoom', () => {
  it('stores the room id in the last-room cookie and follows room changes', () => {
    const { rerender } = render(<RememberRoom roomId={3} />);
    expect(document.cookie).toContain('rg_last_room=3');

    rerender(<RememberRoom roomId={7} />);
    expect(document.cookie).toContain('rg_last_room=7');
  });
});
