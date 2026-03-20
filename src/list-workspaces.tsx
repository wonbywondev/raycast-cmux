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
import { CmuxAccessDeniedError, CmuxNotRunningError, Workspace, closeWorkspace, focusCmux, launchAndSelectWorkspace, listWorkspaces, openWorkspace, selectWorkspace } from "./utils";

export default function ListWorkspacesCommand() {
  const { data, isLoading, error, revalidate } = useCachedPromise(listWorkspaces, [], {
    keepPreviousData: true,
    onError: () => {}, // 에러는 렌더에서 직접 처리 — 기본 에러 바 억제
  });

  const isNotRunning = error instanceof CmuxNotRunningError || error?.name === "CmuxNotRunningError";
  const isAccessDenied = error instanceof CmuxAccessDeniedError || error?.name === "CmuxAccessDeniedError";

  // cmux 미실행이지만 캐시 데이터가 있으면 목록을 계속 표시
  if (isNotRunning && data && data.length > 0) {
    return (
      <List
        isLoading={false}
        searchBarAccessory={
          <List.Dropdown tooltip="상태" onChange={() => {}}>
            <List.Dropdown.Item title="⚠ cmux 꺼짐 — 캐시된 목록" value="off" />
          </List.Dropdown>
        }
      >
        {data.map((ws) => (
          <WorkspaceItem key={ws.ref} workspace={ws} onRefresh={revalidate} cmuxOff />
        ))}
      </List>
    );
  }

  if (isNotRunning) {
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
                onAction={async () => {
                  await open("/Applications/cmux.app");
                  setTimeout(revalidate, 2000);
                }}
              />
              <Action title="새로고침" icon={Icon.RotateClockwise} onAction={revalidate} />
            </ActionPanel>
          }
        />
      </List>
    );
  }

  if (isAccessDenied) {
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
      {data?.map((ws) => <WorkspaceItem key={ws.ref} workspace={ws} onRefresh={revalidate} />)}
    </List>
  );
}

function WorkspaceItem({ workspace: ws, onRefresh, cmuxOff = false }: { workspace: Workspace; onRefresh: () => void; cmuxOff?: boolean }) {
  const accessories: List.Item.Accessory[] = [];

if (ws.pinned) {
    accessories.push({ icon: Icon.Pin, tooltip: "Pinned" });
  }
  if (ws.listening_ports && ws.listening_ports.length > 0) {
    accessories.push({ text: ws.listening_ports.map((p) => `:${p}`).join(" ") });
  }

  return (
    <List.Item
      title={ws.title || `Workspace ${ws.index}`}
      subtitle={ws.current_directory}
      accessories={[...accessories, ...(cmuxOff ? [{ tag: { value: "오프라인", color: Color.SecondaryText } }] : [])]}
      actions={
        <ActionPanel>
          <Action
            title="Switch to Workspace"
            icon={Icon.ArrowRight}
            onAction={async () => {
              if (cmuxOff) {
                await showToast({ style: Toast.Style.Animated, title: `cmux 실행 중...` });
                await launchAndSelectWorkspace(ws.ref);
                focusCmux();
                await showToast({ style: Toast.Style.Success, title: `Switched to ${ws.title}` });
                return;
              }
              try {
                selectWorkspace(ws.ref);
                focusCmux();
                await showToast({ style: Toast.Style.Success, title: `Switched to ${ws.title}` });
              } catch (err) {
                await showToast({ style: Toast.Style.Failure, title: String(err) });
              }
            }}
          />
          {!cmuxOff && <Action
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
          />}
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
                closeWorkspace(ws.ref);
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
