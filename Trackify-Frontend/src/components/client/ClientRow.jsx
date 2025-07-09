import React from "react";
import { Delete } from "@mui/icons-material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { IconButton, TableCell, TableRow } from "@mui/material";
import { capitalizeFirstWord } from "##/src/utility/miscellaneous/capitalize.js";
import { FONTS } from "##/src/utility/utility.js";
import UpdateClient from "##/src/components/client/UpdateClient.jsx";

const ClientRow = ({
  client,
  onEdit,
  onDelete,
  onClose,
  onUpdate,
  theme,
  open,
  buttonLoading,
}) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const tableBodyStyle = {
    fontFamily: FONTS.body,
    fontSize: "14px",
    fontweight: "bold",
  };

  return (
    <>
      <TableRow>
        <TableCell sx={tableBodyStyle}>
          {capitalizeFirstWord(client.name)}
        </TableCell>
        <TableCell sx={tableBodyStyle}>
          {formatDate(client.createdAt)}
        </TableCell>
        <TableCell>
          <IconButton onClick={() => onEdit(client._id)}>
            <EditOutlinedIcon />
          </IconButton>
        </TableCell>
        <TableCell>
          <IconButton onClick={() => onDelete(client._id)}>
            <Delete />
          </IconButton>
        </TableCell>
      </TableRow>
      {open && (
        <UpdateClient
          buttonLoading={buttonLoading}
          clientId={client._id}
          name={client.name}
          onClose={onClose}
          onSave={onUpdate}
          open={open}
          theme={theme}
          title={"Update Client"}
        />
      )}
    </>
  );
};

export default ClientRow;
