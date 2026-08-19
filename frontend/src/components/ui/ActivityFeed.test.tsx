import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ActivityFeed from './ActivityFeed';
import * as activityService from '../../services/activityService';

vi.mock('../../services/activityService');

const mockedGetActivityFeed = vi.mocked(activityService.getActivityFeed);

function makeActivity(overrides: Record<string, any> = {}) {
  return {
    _id: 'act1',
    type: 'lesson_completed',
    courseTitle: 'Intro to React',
    lessonTitle: 'What is React?',
    createdAt: '2026-08-01T10:00:00.000Z',
    ...overrides,
  };
}

describe('ActivityFeed', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('shows a loading spinner while activity is being fetched', () => {
    mockedGetActivityFeed.mockReturnValue(new Promise(() => {}));

    render(<ActivityFeed />);

    expect(screen.getByText(/loading recent activity/i)).toBeInTheDocument();
  });

  it('shows an empty-state message when there is no activity yet', async () => {
    mockedGetActivityFeed.mockResolvedValue({
      activities: [],
      pagination: { page: 1, limit: 20, total: 0, hasMore: false },
    });

    render(<ActivityFeed />);

    expect(await screen.findByText(/no activity yet/i)).toBeInTheDocument();
  });

  it('renders each activity item once loaded', async () => {
    mockedGetActivityFeed.mockResolvedValue({
      activities: [
        makeActivity(),
        makeActivity({
          _id: 'act2',
          type: 'course_started',
          courseTitle: 'Advanced Node',
          createdAt: '2026-08-02T10:00:00.000Z',
        }),
      ],
      pagination: { page: 1, limit: 20, total: 2, hasMore: false },
    });

    render(<ActivityFeed />);

    expect(
      await screen.findByText('Completed "What is React?" in Intro to React')
    ).toBeInTheDocument();
    expect(screen.getByText('Started Advanced Node')).toBeInTheDocument();
  });

  it('shows an error banner with a retry button when loading fails', async () => {
    const user = userEvent.setup();
    mockedGetActivityFeed
      .mockRejectedValueOnce({ response: { data: { message: 'Server error' } } })
      .mockResolvedValueOnce({
        activities: [],
        pagination: { page: 1, limit: 20, total: 0, hasMore: false },
      });

    render(<ActivityFeed />);

    expect(await screen.findByText('Server error')).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: /retry/i });
    await user.click(retryButton);

    expect(await screen.findByText(/no activity yet/i)).toBeInTheDocument();
    expect(mockedGetActivityFeed).toHaveBeenCalledTimes(2);
  });
});
 