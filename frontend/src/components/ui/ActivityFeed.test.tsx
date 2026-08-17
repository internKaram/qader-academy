import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ActivityFeed from './ActivityFeed';
import * as progressService from '../../services/progressService';
import type { Activity } from '../../types/progress';
 
vi.mock('../../services/progressService');
 
const mockedGetActivity = vi.mocked(progressService.getActivity);
 
function makeActivity(overrides: Partial<Activity> = {}): Activity {
  return {
    _id: 'act1',
    type: 'lesson_completed',
    courseTitle: 'Intro to React',
    lessonTitle: 'What is React?',
    occurredAt: '2026-08-01T10:00:00.000Z',
    ...overrides,
  };
}
 
describe('ActivityFeed', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
 
  it('shows a loading spinner while activity is being fetched', () => {
    mockedGetActivity.mockReturnValue(new Promise(() => {}));
 
    render(<ActivityFeed />);
 
    expect(screen.getByText(/loading activity/i)).toBeInTheDocument();
  });
 
  it('shows an empty-state message when there is no activity yet', async () => {
    mockedGetActivity.mockResolvedValue([]);
 
    render(<ActivityFeed />);
 
    expect(await screen.findByText(/no activity yet/i)).toBeInTheDocument();
  });
 
  it('renders each activity item once loaded', async () => {
    mockedGetActivity.mockResolvedValue([
      makeActivity(),
      makeActivity({
        _id: 'act2',
        type: 'enrolled',
        courseTitle: 'Advanced Node',
        lessonTitle: undefined,
        occurredAt: '2026-08-02T10:00:00.000Z',
      }),
    ]);
 
    render(<ActivityFeed />);
 
    expect(
      await screen.findByText('Completed "What is React?" in Intro to React')
    ).toBeInTheDocument();
    expect(screen.getByText('Enrolled in Advanced Node')).toBeInTheDocument();
  });
 
  it('shows an error banner with a retry button when loading fails', async () => {
    const user = userEvent.setup();
    mockedGetActivity
      .mockRejectedValueOnce({ response: { data: { message: 'Server error' } } })
      .mockResolvedValueOnce([]);
 
    render(<ActivityFeed />);
 
    expect(await screen.findByText('Server error')).toBeInTheDocument();
 
    const retryButton = screen.getByRole('button', { name: /try again/i });
    await user.click(retryButton);
 
    expect(await screen.findByText(/no activity yet/i)).toBeInTheDocument();
    expect(mockedGetActivity).toHaveBeenCalledTimes(2);
  });
});
 