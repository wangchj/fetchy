import { Box, CloseButton, Group, Tabs, Text } from '@mantine/core';
import { MouseEvent } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from 'renderer/redux/store';
import { resultsSlice } from 'renderer/redux/results-slice';
import { workspaceSlice } from 'renderer/redux/workspace-slice';
import resultEditorPath from 'renderer/utils/result-editor-path';
import RequestForm from './request-form';
import MethodIcon from './method-icon';

export default function OpenedRequests() {
  const dispatch = useDispatch();
  const workspace = useSelector((state: RootState) => state.workspace);
  const openedRequests = workspace.openedRequests;
  const selectedRequest = openedRequests?.[workspace.selectedRequestIndex];

  return Array.isArray(openedRequests) && openedRequests.length > 0 ?
    (
      <Tabs
        value={selectedRequest.id}
        onChange={id => dispatch(workspaceSlice.actions.setSelectedRequest(id))}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <Tabs.List
          style={{flexGrow: 0, flexShrink: 1}}
        >
          {
            openedRequests.map((request, index) => (
              <Tabs.Tab
                key={request.id}
                value={request.id}
              >
                <Group gap="lg">

                  <Group gap="xs">
                    <MethodIcon method={request.request.method}/>
                    {request.request.name}
                  </Group>

                  <Group gap="sm">
                    {request.dirty && <Text c={'gray'} opacity={0.2} size='xs'>●</Text>}

                    <CloseButton
                      size="sm"
                      onClick={(event: MouseEvent) => {
                        event.stopPropagation();

                        // Look for Monaco model
                        const model = window.monaco.editor.getModels()?.find(
                          (m: any) => m._associatedResource.path === resultEditorPath(request.id)
                        );

                        // Dispose Monaco model if exists.
                        if (model) {
                          model.dispose();
                        }

                        dispatch(resultsSlice.actions.deleteResult(request.id));
                        dispatch(workspaceSlice.actions.closeRequest(index));
                      }}
                    />
                  </Group>
                </Group>
              </Tabs.Tab>
            ))
          }
        </Tabs.List>

        {openedRequests.map(openedRequest => (
          <Tabs.Panel
            key={openedRequest.id}
            value={openedRequest.id}
            style={{
              flexGrow: 1,
            }}
          >
            <Box p="md" style={{height: '100%'}}>
              <RequestForm/>
            </Box>
          </Tabs.Panel>
        ))}
      </Tabs>
    ):
    <div>No request selected</div>
}
