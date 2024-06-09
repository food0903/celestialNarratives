import * as React from 'react';
import { styled } from '@mui/system';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { TableVirtuoso, TableComponents } from 'react-virtuoso';
import { useRouter } from 'next/navigation';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useRooms } from '@/hooks/useRooms';
import { getSession } from '@/actions';

interface Room {
  room_id: number;
  room_name: string;
  status: string;
  num_players: number;
  max_players: number;
  created_at: string;
  actions?: string;
}

interface ColumnData {
  dataKey: keyof Room;
  label: string;
  numeric?: boolean;
  width: number;
}

const columns: ColumnData[] = [
  {
    width: 200,
    label: 'Room Name',
    dataKey: 'room_name',
  },
  {
    width: 120,
    label: 'Status',
    dataKey: 'status',
  },
  {
    width: 120,
    label: 'Players',
    dataKey: 'num_players',
    numeric: true,
  },
  {
    width: 120,
    label: 'Created At',
    dataKey: 'created_at',
  },
  {
    width: 100,
    label: 'Actions',
    dataKey: 'actions', // This is just a placeholder
  },
];

const VirtuosoTableComponents: TableComponents<Room> = {
  Scroller: React.forwardRef<HTMLDivElement>((props, ref) => (
    <TableContainer component={Paper} {...props} ref={ref} />
  )),
  Table: (props) => (
    <Table {...props} sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }} />
  ),
  TableHead: styled('thead')({}),
  TableRow: ({ item: _item, ...props }) => <TableRow {...props} />,
  TableBody: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
    <TableBody {...props} ref={ref} />
  )),
};

function fixedHeaderContent() {
  return (
    <TableRow>
      {columns.map((column) => (
        <TableCell
          key={column.dataKey}
          variant="head"
          align={column.numeric ? 'right' : 'left'}
          style={{ width: column.width }}
          className='bg-gray-400'
        >
          {column.label}
        </TableCell>
      ))}
    </TableRow>
  );
}

function rowContent(_index: number, row: Room, router: AppRouterInstance) {
  return (
    <React.Fragment>
      {columns.map((column) => (
        <TableCell
          key={column.dataKey}
          align={column.numeric ? 'right' : 'left'}
        >
          {column.dataKey === 'created_at'
            ? new Date(row[column.dataKey]).toLocaleString()
            : column.dataKey === 'num_players'
            ? `${row.num_players}/${row.max_players}`
            : column.dataKey === 'actions'
            ? <button onClick={() => joinRoom(row.room_id, router) } className='rounded-md bg-slate-200 p-4'>Join</button>
            : row[column.dataKey]}
        </TableCell>
      ))}
    </React.Fragment>
  );
}

const joinRoom = async (room_id: number, router: AppRouterInstance) => {
  const session = await getSession();
  const response = await fetch('http://127.0.0.1:5000/join_room', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      'room_id': room_id,
      'user_id': session.id
    }),
    credentials: 'include',
  })

  const data = await response.json();

  if(response.ok){
    console.log('Joined room', data.room_id);
    router.push(`/lobby/${data.room_id}`);
  } else {
    console.error('error:', data.error);
  }
}

const RoomList: React.FC = () => {
  const router = useRouter();
  const rooms = useRooms();
 

  return (
    <Paper style={{ height: 500, width: '100%' }}>
      <TableVirtuoso
        data={rooms}
        components={VirtuosoTableComponents}
        fixedHeaderContent={fixedHeaderContent}
        itemContent={(index, room) => rowContent(index, room, router)}
      />
    </Paper>
  );
};

export default RoomList;
