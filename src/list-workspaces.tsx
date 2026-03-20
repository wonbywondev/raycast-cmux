import {
  Action,
  ActionPanel,
  Clipboard,
  Color,
  Icon,
  List,
  Toast,
  open,
  showToast,
} from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { CmuxAccessDeniedError, CmuxNotRunningError, Workspace, closeWorkspace, focusCmux, listWorkspaces, openWorkspace, selectWorkspace } from "./utils";

export default function ListWorkspacesCommand() {
  const { data, isLoading, error, revalidate } = useCachedPromise(listWorkspaces, [], {
    keepPreviousData: true,
  });

  if (error instanceof CmuxNotRunningError) {
    return (
      <List>
        <List.EmptyView
          icon={Icon.Warning}
          title="cmux가 실행 중이 아닙니다"
          description="cmux를 실행한 후 다시 시도하세요"
          actions={
            <ActionPanel>
              <Action
                title="cmux 실행"
                icon={Icon.Play}
                onAction={() => open("/Applications/cmux.app")}
              />
            </ActionPanel>
          }
        />
      </List>
    );
  }

  if (error instanceof CmuxAccessDeniedError) {
    return (
      <List>
        <List.EmptyView
          icon={Icon.Lock}
          title="접근 권한 없음"
          description="cmux Settings → Socket Control → Automation mode로 변경하세요"
          actions={
            <ActionPanel>
              <Action
                title="cmux 설정 열기"
                icon={Icon.Gear}
                onAction={() => open("/Applications/cmux.app")}
              />
            </ActionPanel>
          }
        />
      </List>
    );
  }

  return (
    <List isLoading={isLoading}>
      {data?.map((ws) => <WorkspaceItem key={ws.id} workspace={ws} onRefresh={revalidate} />)}
    </List>
  );
}

function WorkspaceItem({ workspace: ws, onRefresh }: { workspace: Workspace; onRefresh: () => void }) {
  const accessories: List.Item.Accessory[] = [];

  if (ws.selected) {
    accessories.push({ icon: { source: Icon.Dot, tintColor: Color.Green }, tooltip: "Active" });
  }
  if (ws.pinned) {
    accessories.push({ icon: Icon.Pin, tooltip: "Pinned" });
  }
  if (ws.listening_ports.length > 0) {
    accessories.push({ text: ws.listening_ports.map((p) => `:${p}`).join(" ") });
  }

  return (
    <List.Item
      title={ws.title || `Workspace ${ws.index}`}
      subtitle={ws.current_directory}
      accessories={accessories}
      actions={
        <ActionPanel>
          <Action
            title="Switch to Workspace"
            icon={Icon.ArrowRight}
            onAction={async () => {
              try {
                selectWorkspace(ws.id);
                focusCmux();
                await showToast({ style: Toast.Style.Success, title: `Switched to ${ws.title}` });
              } catch (err) {
                await showToast({ style: Toast.Style.Failure, title: String(err) });
              }
            }}
          />
          <Action
            title="Open Directory as New Workspace"
            icon={Icon.Plus}
            shortcut={{ modifiers: ["cmd"], key: "o" }}
            onAction={async () => {
              try {
                openWorkspace(ws.current_directory);
                focusCmux();
                await showToast({ style: Toast.Style.Success, title: `Opened ${ws.current_directory}` });
              } catch (err) {
                await showToast({ style: Toast.Style.Failure, title: String(err) });
              }
            }}
          />
          <Action
            title="Copy Path"
            icon={Icon.Clipboard}
            shortcut={{ modifiers: ["cmd"], key: "c" }}
            onAction={async () => {
              await Clipboard.copy(ws.current_directory);
              await showToast({ style: Toast.Style.Success, title: "Path copied" });
            }}
          />
          <Action
            title="Close Workspace"
            icon={Icon.Trash}
            style={Action.Style.Destructive}
            shortcut={{ modifiers: ["cmd"], key: "delete" }}
            onAction={async () => {
              try {
                closeWorkspace(ws.id);
                onRefresh();
                await showToast({ style: Toast.Style.Success, title: `Closed ${ws.title}` });
              } catch (err) {
                await showToast({ style: Toast.Style.Failure, title: String(err) });
              }
            }}
          />
        </ActionPanel>
      }
    />
  );
}
