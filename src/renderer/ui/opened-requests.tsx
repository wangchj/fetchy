import { Box, CloseButton, Group, Tabs, Text } from '@mantine/core';
import { MouseEvent } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from 'renderer/redux/store';
import { workspaceSlice } from 'renderer/redux/workspace-slice';
import RequestForm from './request-form';

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
      >
        <Tabs.List>
          {
            openedRequests.map((request, index) => (
              <Tabs.Tab
                key={request.id}
                value={request.id}
              >
                <Group gap="sm">
                  {request.request.name}

                  {request.dirty && <Text c={'blue'} size='xs'>●</Text>}

                  <CloseButton
                    size="sm"
                    onClick={(event: MouseEvent) => {
                      event.stopPropagation();
                      dispatch(workspaceSlice.actions.closeRequest(index));
                    }}
                  />
                </Group>
              </Tabs.Tab>
            ))
          }
        </Tabs.List>

        {openedRequests.map(openedRequest => (
          <Tabs.Panel
            key={openedRequest.id}
            value={openedRequest.id}
          >
            <Box p="md">
              <RequestForm/>
            </Box>
          </Tabs.Panel>
        ))}
      </Tabs>
    ):
    <div>No request selected</div>
}
