import { Snowflake } from "@theinternetfolks/snowflake";
import { client } from "../models/db";
import { QueryResult } from "pg";

//Add member
const addMember = async (req: any, res: any) => {
  try {
    const member_id = Snowflake.generate();
    const timeStamp = new Date().toISOString();
    const { community_id, user_id, role_id } = req.body;

    if (!community_id || !user_id || !role_id) {
      return res
        .status(400)
        .json({ status: false, message: "All fields are required" });
    }
    const memberQuery = `INSERT INTO members(id, community_id, user_id, role_id, created_at) VALUES($1, $2, $3, $4, $5)`;
    const memberParams: any[] = [
      member_id,
      community_id,
      user_id,
      role_id,
      timeStamp,
    ];
    const memberResult: QueryResult<any> = await client.query(
      memberQuery,
      memberParams
    );

    res.status(200).json({
      status: true,
      content: {
        data: {
          id: member_id,
          community: community_id,
          user: user_id,
          role: role_id,
          created_at: timeStamp,
        },
      },
      message: "Member successfully added to the communnity",
    });
  } catch (err: any) {
    console.log(err);
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
};

//Removing members
const removeMember = async (req: any, res: any) => {
  try {
    const member_id = req.params.id;
    // console.log(member_id);
    const user_id = req.user.id;
    // console.log(user_id);
    const adminRole_id = 7177195729255833730;

    //Verifying if the user is admin or not
    const verifyAdminQuery = `SELECT * FROM members WHERE user_id = $1 AND role_id = $2`;
    const verifyAdminParams = [user_id, adminRole_id];
    const verifyAdminResult: QueryResult<any> = await client.query(
      verifyAdminQuery, verifyAdminParams
    );
    // console.log("community id: ");

    const community_id = verifyAdminResult.rows[0].community_id;
    // console.log("community id: ",verifyAdminResult.rows[0]);

    const deleteMemberQuery = `DELETE FROM members WHERE community_id = $1 AND user_id = $2`;
    const deleteParams: any[] = [community_id, member_id];
    const deleteMemberResult: QueryResult<any> = await client.query(
      deleteMemberQuery, deleteParams
    );

    res.status(200).json({ status: true, message: "Member removed" });
  } catch (err: any) {
    console.log("This is error: ",err);
    res
      .status(500)
      .json({ status: false, content: { message: "Internal Server Error" } });
  }
};

module.exports = { addMember, removeMember };
