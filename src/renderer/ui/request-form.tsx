import {
  Button,
  Group,
  Notification,
  Select,
  Stack,
  TextInput,
} from "@mantine/core";
import { useEffect, useState } from "react";
import RequestConfig from "./request-config";
import RequestOutput from "./request-output";
import { useDispatch, useSelector } from "react-redux";
import { RootState, store } from "renderer/redux/store";
import { workspaceSlice } from "renderer/redux/workspace-slice";
import { projectSlice } from "renderer/redux/project-slice";
import { resultsSlice } from "renderer/redux/results-slice";

import Split from 'react-split-grid';

export default function RequestForm() {
  // const [selectedTab, setSelectedTab] = useState<string>('Config');
  const [error, setError] = useState<string>();

  const [gridTemplateColumns, setGridTemplateColumns] = useState('1fr');

  const dispatch = useDispatch();
  const workspace = useSelector((state: RootState) => state.workspace);
  const openedRequest = workspace.openedRequests[workspace.selectedRequestIndex];
  const request = openedRequest.request;
  const result = useSelector((state: RootState) => state.results)[openedRequest.id];

  // Adjust split layout based on the result.
  useEffect(() => {
    if (result) {
      if (gridTemplateColumns === '1fr') {
        setGridTemplateColumns('1fr 1px 2fr');
      }
    }
    else {
      if (gridTemplateColumns !== '1fr') {
        setGridTemplateColumns('1fr');
      }
    }
  }, [result]);

  /**
   * Handles Send button click event.
   */
  async function onSendClick() {
    setError('');

    try {
      const resp = await window.sendRequest(request);
      dispatch(resultsSlice.actions.setResult({id: openedRequest.id, result: resp}));
    }
    catch (error) {
      setError(error.message.replace('Error invoking remote method \'sendRequest\': ', ''));
    }
  }

  /**
   * Handles Save button click event.
   */
  async function onSaveClick() {
    const openedRequest = workspace.openedRequests[workspace.selectedRequestIndex];

    if (openedRequest.dirty) {
      dispatch(projectSlice.actions.setRequest({
        id: openedRequest.id, request: openedRequest.request
      }));

      try {
        await window.saveProject(workspace.projectRef.$ref, store.getState().project);
        dispatch(workspaceSlice.actions.setDirty(false));
        await window.saveWorkspace(store.getState().workspace);
      }
      catch (error) {
        console.log("Error saving project", error);
      }
    }
  }

  return (
    <Stack
      h="100%"
    >
      <Group grow preventGrowOverflow={false}>
        <Group
          gap="xs"
          style={{flexGrow: 1}}
        >
          <Select
            style={{flexGrow: 0, width: '120px'}}
            data={['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']}
            value={request.method}
            onChange={
              value => value === null ? null : dispatch(
                workspaceSlice.actions.updateRequest({path: 'method', value})
              )
            }
          />

          <TextInput
            style={{flexGrow: 1}}
            value={request.url}
            onChange={
              event => dispatch(
                workspaceSlice.actions.updateRequest(
                  {path: 'url', value: event.currentTarget.value}
                )
              )
            }
          />
        </Group>

        <Group
          gap="xs"
          style={{flexGrow: 0, flexShrink: 1}}
        >
          <Button
            onClick={onSendClick}
          >
            Send
          </Button>

          <Button
            onClick={onSaveClick}
          >
            Save
          </Button>
        </Group>
      </Group>

      {error && <Notification color="red" onClose={() => setError('')}>{error}</Notification>}

      <Split
        cursor="ew-resize"
        // https://github.com/nathancahill/split/pull/728
        // @ts-ignore
        render={({getGridProps, getGutterProps}) => (
          <div className="request-split-grid" {...getGridProps()}>
            <RequestConfig request={request}/>
            {result && <div className="split-handle" {...getGutterProps('column', 1)}></div>}
            {result && <RequestOutput/>}
          </div>
        )}
        gridTemplateColumns={gridTemplateColumns}
        onDrag={(d, t, s) => setGridTemplateColumns(s)}
      />

    </Stack>
  )
}
