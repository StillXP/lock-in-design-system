import { useState, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within } from 'storybook/test';
import { Button, InputField, Modal } from '@lockin/react';
import { specMeta } from '../../blocks/data';

type ModalArgs = Omit<ComponentProps<typeof Modal>, 'open' | 'onClose'>;

/** Modals are stateful: each story renders a trigger button and manages `open`. */
function ModalDemo({ trigger = 'Open modal', ...args }: ModalArgs & { trigger?: string }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        {trigger}
      </Button>
      <Modal
        {...args}
        open={open}
        onClose={close}
        footer={
          args.footer ?? (
            <>
              <Button variant="secondary" onClick={close}>Cancel</Button>
              <Button onClick={close}>Save</Button>
            </>
          )
        }
      />
    </>
  );
}

const meta = {
  title: 'Organisms/Modal',
  ...specMeta('modal'),
  component: Modal,
  args: {
    open: false,
    onClose: () => {},
    title: 'Edit match',
    description: 'Changes are visible to both teams immediately.',
    children: <InputField label="Final score" defaultValue="3 – 1" />,
  },
  argTypes: { open: { control: false }, onClose: { control: false } },
  render: ({ open: _open, onClose: _onClose, ...args }) => <ModalDemo {...args} />,
  parameters: { docs: { story: { inline: false, height: '28rem' } } },
} satisfies Meta<typeof Modal>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Open dialog, so the backdrop, panel and footer are visible to visual regression. */
export const Open: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open modal' }));
  },
};

export const Sizes: Story = {
  render: ({ open: _open, onClose: _onClose, ...args }) => (
    <div className="fd-row">
      {(['sm', 'md', 'lg', 'fullscreen'] as const).map((size) => (
        <ModalDemo key={size} {...args} size={size} trigger={`Open ${size}`} />
      ))}
    </div>
  ),
};

/** Destructive confirmation: role="alertdialog", no backdrop dismissal. */
export const Confirm: Story = { render: () => <ConfirmDemo /> };

export const ConfirmOpen: Story = {
  render: () => <ConfirmDemo />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Delete team' }));
  },
};

function ConfirmDemo() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <>
      <Button variant="danger" iconStart="trash" onClick={() => setOpen(true)}>
        Delete team
      </Button>
      <Modal
        open={open}
        onClose={close}
        role="alertdialog"
        size="sm"
        closeOnBackdropClick={false}
        title="Delete Team Rockets?"
        description="Their match history will be removed. This can't be undone."
        footer={
          <>
            <Button variant="secondary" onClick={close}>Keep team</Button>
            <Button variant="danger" onClick={close}>Delete team</Button>
          </>
        }
      />
    </>
  );
}
