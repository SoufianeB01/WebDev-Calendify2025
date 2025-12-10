using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace CalendifyWebAppAPI.Migrations
{
    /// <inheritdoc />
    public partial class pashwordhasher : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Admins_Employees_UserId",
                table: "Admins");

            migrationBuilder.DropForeignKey(
                name: "FK_EventParticipations_Employees_UserId",
                table: "EventParticipations");

            migrationBuilder.DropForeignKey(
                name: "FK_EventParticipations_Events_EventId",
                table: "EventParticipations");

            migrationBuilder.DropForeignKey(
                name: "FK_Events_Employees_CreatedBy",
                table: "Events");

            migrationBuilder.DropForeignKey(
                name: "FK_GroupMemberships_Employees_UserId",
                table: "GroupMemberships");

            migrationBuilder.DropForeignKey(
                name: "FK_GroupMemberships_Groups_GroupId",
                table: "GroupMemberships");

            migrationBuilder.DropForeignKey(
                name: "FK_OfficeAttendances_Employees_UserId",
                table: "OfficeAttendances");

            migrationBuilder.DropForeignKey(
                name: "FK_RoomBookings_Employees_UserId",
                table: "RoomBookings");

            migrationBuilder.DropForeignKey(
                name: "FK_RoomBookings_Rooms_RoomId",
                table: "RoomBookings");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Rooms",
                table: "Rooms");

            migrationBuilder.DropPrimaryKey(
                name: "PK_RoomBookings",
                table: "RoomBookings");

            migrationBuilder.DropPrimaryKey(
                name: "PK_OfficeAttendances",
                table: "OfficeAttendances");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Groups",
                table: "Groups");

            migrationBuilder.DropPrimaryKey(
                name: "PK_GroupMemberships",
                table: "GroupMemberships");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Events",
                table: "Events");

            migrationBuilder.DropPrimaryKey(
                name: "PK_EventParticipations",
                table: "EventParticipations");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Employees",
                table: "Employees");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Admins",
                table: "Admins");

            migrationBuilder.RenameTable(
                name: "Rooms",
                newName: "rooms");

            migrationBuilder.RenameTable(
                name: "RoomBookings",
                newName: "roombookings");

            migrationBuilder.RenameTable(
                name: "OfficeAttendances",
                newName: "officeattendances");

            migrationBuilder.RenameTable(
                name: "Groups",
                newName: "groups");

            migrationBuilder.RenameTable(
                name: "GroupMemberships",
                newName: "groupmemberships");

            migrationBuilder.RenameTable(
                name: "Events",
                newName: "events");

            migrationBuilder.RenameTable(
                name: "EventParticipations",
                newName: "eventparticipations");

            migrationBuilder.RenameTable(
                name: "Employees",
                newName: "employees");

            migrationBuilder.RenameTable(
                name: "Admins",
                newName: "admins");

            migrationBuilder.RenameIndex(
                name: "IX_RoomBookings_UserId",
                table: "roombookings",
                newName: "IX_roombookings_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_OfficeAttendances_UserId",
                table: "officeattendances",
                newName: "IX_officeattendances_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_GroupMemberships_GroupId",
                table: "groupmemberships",
                newName: "IX_groupmemberships_GroupId");

            migrationBuilder.RenameIndex(
                name: "IX_Events_CreatedBy",
                table: "events",
                newName: "IX_events_CreatedBy");

            migrationBuilder.RenameIndex(
                name: "IX_EventParticipations_EventId",
                table: "eventparticipations",
                newName: "IX_eventparticipations_EventId");

            migrationBuilder.RenameIndex(
                name: "IX_Admins_UserId",
                table: "admins",
                newName: "IX_admins_UserId");

            migrationBuilder.AddColumn<TimeSpan>(
                name: "EndTime",
                table: "events",
                type: "interval",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0, 0, 0));

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "events",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<TimeSpan>(
                name: "StartTime",
                table: "events",
                type: "interval",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0, 0, 0));

            migrationBuilder.AddPrimaryKey(
                name: "PK_rooms",
                table: "rooms",
                column: "RoomId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_roombookings",
                table: "roombookings",
                columns: new[] { "RoomId", "UserId", "BookingDate", "StartTime" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_officeattendances",
                table: "officeattendances",
                column: "AttendanceId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_groups",
                table: "groups",
                column: "GroupId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_groupmemberships",
                table: "groupmemberships",
                columns: new[] { "UserId", "GroupId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_events",
                table: "events",
                column: "EventId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_eventparticipations",
                table: "eventparticipations",
                columns: new[] { "UserId", "EventId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_employees",
                table: "employees",
                column: "UserId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_admins",
                table: "admins",
                column: "AdminId");

            migrationBuilder.CreateTable(
                name: "eventreviews",
                columns: table => new
                {
                    ReviewId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EventId = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    Rating = table.Column<int>(type: "integer", nullable: false),
                    Comment = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_eventreviews", x => x.ReviewId);
                    table.ForeignKey(
                        name: "FK_eventreviews_employees_UserId",
                        column: x => x.UserId,
                        principalTable: "employees",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_eventreviews_events_EventId",
                        column: x => x.EventId,
                        principalTable: "events",
                        principalColumn: "EventId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_eventreviews_EventId",
                table: "eventreviews",
                column: "EventId");

            migrationBuilder.CreateIndex(
                name: "IX_eventreviews_UserId",
                table: "eventreviews",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_admins_employees_UserId",
                table: "admins",
                column: "UserId",
                principalTable: "employees",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_eventparticipations_employees_UserId",
                table: "eventparticipations",
                column: "UserId",
                principalTable: "employees",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_eventparticipations_events_EventId",
                table: "eventparticipations",
                column: "EventId",
                principalTable: "events",
                principalColumn: "EventId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_events_employees_CreatedBy",
                table: "events",
                column: "CreatedBy",
                principalTable: "employees",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_groupmemberships_employees_UserId",
                table: "groupmemberships",
                column: "UserId",
                principalTable: "employees",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_groupmemberships_groups_GroupId",
                table: "groupmemberships",
                column: "GroupId",
                principalTable: "groups",
                principalColumn: "GroupId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_officeattendances_employees_UserId",
                table: "officeattendances",
                column: "UserId",
                principalTable: "employees",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_roombookings_employees_UserId",
                table: "roombookings",
                column: "UserId",
                principalTable: "employees",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_roombookings_rooms_RoomId",
                table: "roombookings",
                column: "RoomId",
                principalTable: "rooms",
                principalColumn: "RoomId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_admins_employees_UserId",
                table: "admins");

            migrationBuilder.DropForeignKey(
                name: "FK_eventparticipations_employees_UserId",
                table: "eventparticipations");

            migrationBuilder.DropForeignKey(
                name: "FK_eventparticipations_events_EventId",
                table: "eventparticipations");

            migrationBuilder.DropForeignKey(
                name: "FK_events_employees_CreatedBy",
                table: "events");

            migrationBuilder.DropForeignKey(
                name: "FK_groupmemberships_employees_UserId",
                table: "groupmemberships");

            migrationBuilder.DropForeignKey(
                name: "FK_groupmemberships_groups_GroupId",
                table: "groupmemberships");

            migrationBuilder.DropForeignKey(
                name: "FK_officeattendances_employees_UserId",
                table: "officeattendances");

            migrationBuilder.DropForeignKey(
                name: "FK_roombookings_employees_UserId",
                table: "roombookings");

            migrationBuilder.DropForeignKey(
                name: "FK_roombookings_rooms_RoomId",
                table: "roombookings");

            migrationBuilder.DropTable(
                name: "eventreviews");

            migrationBuilder.DropPrimaryKey(
                name: "PK_rooms",
                table: "rooms");

            migrationBuilder.DropPrimaryKey(
                name: "PK_roombookings",
                table: "roombookings");

            migrationBuilder.DropPrimaryKey(
                name: "PK_officeattendances",
                table: "officeattendances");

            migrationBuilder.DropPrimaryKey(
                name: "PK_groups",
                table: "groups");

            migrationBuilder.DropPrimaryKey(
                name: "PK_groupmemberships",
                table: "groupmemberships");

            migrationBuilder.DropPrimaryKey(
                name: "PK_events",
                table: "events");

            migrationBuilder.DropPrimaryKey(
                name: "PK_eventparticipations",
                table: "eventparticipations");

            migrationBuilder.DropPrimaryKey(
                name: "PK_employees",
                table: "employees");

            migrationBuilder.DropPrimaryKey(
                name: "PK_admins",
                table: "admins");

            migrationBuilder.DropColumn(
                name: "EndTime",
                table: "events");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "events");

            migrationBuilder.DropColumn(
                name: "StartTime",
                table: "events");

            migrationBuilder.RenameTable(
                name: "rooms",
                newName: "Rooms");

            migrationBuilder.RenameTable(
                name: "roombookings",
                newName: "RoomBookings");

            migrationBuilder.RenameTable(
                name: "officeattendances",
                newName: "OfficeAttendances");

            migrationBuilder.RenameTable(
                name: "groups",
                newName: "Groups");

            migrationBuilder.RenameTable(
                name: "groupmemberships",
                newName: "GroupMemberships");

            migrationBuilder.RenameTable(
                name: "events",
                newName: "Events");

            migrationBuilder.RenameTable(
                name: "eventparticipations",
                newName: "EventParticipations");

            migrationBuilder.RenameTable(
                name: "employees",
                newName: "Employees");

            migrationBuilder.RenameTable(
                name: "admins",
                newName: "Admins");

            migrationBuilder.RenameIndex(
                name: "IX_roombookings_UserId",
                table: "RoomBookings",
                newName: "IX_RoomBookings_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_officeattendances_UserId",
                table: "OfficeAttendances",
                newName: "IX_OfficeAttendances_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_groupmemberships_GroupId",
                table: "GroupMemberships",
                newName: "IX_GroupMemberships_GroupId");

            migrationBuilder.RenameIndex(
                name: "IX_events_CreatedBy",
                table: "Events",
                newName: "IX_Events_CreatedBy");

            migrationBuilder.RenameIndex(
                name: "IX_eventparticipations_EventId",
                table: "EventParticipations",
                newName: "IX_EventParticipations_EventId");

            migrationBuilder.RenameIndex(
                name: "IX_admins_UserId",
                table: "Admins",
                newName: "IX_Admins_UserId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Rooms",
                table: "Rooms",
                column: "RoomId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_RoomBookings",
                table: "RoomBookings",
                columns: new[] { "RoomId", "UserId", "BookingDate", "StartTime" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_OfficeAttendances",
                table: "OfficeAttendances",
                column: "AttendanceId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Groups",
                table: "Groups",
                column: "GroupId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_GroupMemberships",
                table: "GroupMemberships",
                columns: new[] { "UserId", "GroupId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_Events",
                table: "Events",
                column: "EventId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_EventParticipations",
                table: "EventParticipations",
                columns: new[] { "UserId", "EventId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_Employees",
                table: "Employees",
                column: "UserId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Admins",
                table: "Admins",
                column: "AdminId");

            migrationBuilder.AddForeignKey(
                name: "FK_Admins_Employees_UserId",
                table: "Admins",
                column: "UserId",
                principalTable: "Employees",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_EventParticipations_Employees_UserId",
                table: "EventParticipations",
                column: "UserId",
                principalTable: "Employees",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_EventParticipations_Events_EventId",
                table: "EventParticipations",
                column: "EventId",
                principalTable: "Events",
                principalColumn: "EventId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Events_Employees_CreatedBy",
                table: "Events",
                column: "CreatedBy",
                principalTable: "Employees",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_GroupMemberships_Employees_UserId",
                table: "GroupMemberships",
                column: "UserId",
                principalTable: "Employees",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_GroupMemberships_Groups_GroupId",
                table: "GroupMemberships",
                column: "GroupId",
                principalTable: "Groups",
                principalColumn: "GroupId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_OfficeAttendances_Employees_UserId",
                table: "OfficeAttendances",
                column: "UserId",
                principalTable: "Employees",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_RoomBookings_Employees_UserId",
                table: "RoomBookings",
                column: "UserId",
                principalTable: "Employees",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_RoomBookings_Rooms_RoomId",
                table: "RoomBookings",
                column: "RoomId",
                principalTable: "Rooms",
                principalColumn: "RoomId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
