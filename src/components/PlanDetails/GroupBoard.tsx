/**
 * ASK : This file is not used ??
 *
 *  GroupBoard.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */

import { ReactNode, useContext, useEffect, useState } from "react";

import { CalculatorOutlined, ClockCircleOutlined, ExperimentOutlined, ExportOutlined, UserOutlined } from "@ant-design/icons";
import {
  Box,
  IconButton,
  Toolbar,
  Tooltip,
  Typography
} from "@mui/material";

import { DDCategory, DDType, DragAndDrop } from '@digitalaidseattle/draganddrop';

import "@digitalaidseattle/draganddrop/dist/draganddrop.css";
import { placementService } from "../../api/cePlacementService";
import { planEvaluator } from "../../api/planEvaluator";
import { planGenerator } from "../../api/planGenerator";
import { Identifier, Placement } from "../../api/types";
import { PlanContext } from "../../pages/plan";
import { StudentCard } from "../StudentCard";
import { GroupCard } from "../GroupCard";
import { planExporter } from "../../api/planExporter";
import { useNotifications } from "@digitalaidseattle/core";


type PlacementWrapper = Placement & DDType

export const GroupBoard: React.FC = () => {
  const { plan, setPlan } = useContext(PlanContext);

  const [categories, setCategories] = useState<DDCategory<string>[]>([]);
  const [placementWrappers, setPlacementWrappers] = useState<Map<DDCategory<string>, PlacementWrapper[]>>(new Map());
  const [initialized, setInitialized] = useState<boolean>(false);
  const [showGroupDetails, setShowGroupDetails] = useState<boolean>(false);
  const [showStudentDetails, setStudentDetails] = useState<boolean>(false);

  const notifications = useNotifications();

  useEffect(() => {
    if (plan && !initialized) {
      const temCats: DDCategory<string>[] = plan.groups
        .map(group => {
          return { label: group.name, value: group.id! as string }
        })
        .sort((cat0, cat1) => cat0.label.localeCompare(cat1.label))

      const placementMap = new Map();
      temCats.forEach(category => {
        placementMap.set(category, plan.placements
          .filter(placement => category.value === placement.group_id)
          .map(placement => {
            return {
              ...placement,
              id: `${placement.plan_id}:${placement.student_id}`,
            } as PlacementWrapper
          })
        );
      });

      setPlacementWrappers(placementMap);
      setCategories(temCats);
      setInitialized(true);
    }
  }, [plan, initialized])

  function handleChange(container: Map<string, unknown>, placement: Placement) {
    const newGroupId = container.get('containerId') as Identifier;
    const newIndex = container.get('newIndex') as Identifier;
    console.log(newGroupId, newIndex);
    // find old group; iterate over groups looking for the student
    placementService
      .updatePlacement(placement.plan_id, placement.student_id, { group_id: newGroupId })
      .then(resp => console.log(resp))
  }

  function cellRender(item: PlacementWrapper): ReactNode {
    return <StudentCard placement={item} showDetails={showStudentDetails} />
  }

  const headerRenderer = (cat: DDCategory<string>): ReactNode => {
    const group = plan.groups.find(g => g.id === cat.value);
    return (group &&
      <GroupCard group={group} showDetails={showGroupDetails} />
    )
  };

  function seedGroups(): void {
    planGenerator.seedPlan(plan)
      .then((seeded) => {
        setPlan(seeded);
        console.log('Plan seed success');
        console.log('Seeded plan', seeded);
        setInitialized(false);
      })
      .catch((err) => console.error(err));
  }

  // TODO : This function will call to add the time window
  function calculate(): void {
    planEvaluator.evaluate(plan)
      .then(evaluated => {
        setShowGroupDetails(true);
        setPlan(evaluated);
        console.log('Evaluated plan', evaluated);

        setInitialized(false)
        console.log('initialized is False');
      })
      .catch((err) => console.error(err));
  }

  function exportPlan(): void {
    planExporter.exportPlan(plan)
      .then((exported) => {
        if (exported) {
          notifications.success(`${plan.name} exported successfully`);
        } else {
          notifications.error('Plan export failed');
        }
      })
  }

  function handleGroupDetails(): void {
    setShowGroupDetails(!showGroupDetails);
  }

  function handleStudentDetails(): void {
    setStudentDetails(!showStudentDetails);
  }

  return (
    <>
      <Box sx={{ marginTop: 1 }}  >
        <Toolbar>

          <Typography variant="h3" component="div" sx={{ flexGrow: 1 }}>
            Groups
          </Typography>

          <Tooltip title="Seed groups">
            <IconButton color="inherit" onClick={seedGroups}>
              <ExperimentOutlined />
            </IconButton>
          </Tooltip>

          <Tooltip title="Calculate plan">
            <IconButton color="inherit" onClick={calculate}>
              <CalculatorOutlined />
            </IconButton>
          </Tooltip>

          <Tooltip title="Export plan">
            <IconButton color="inherit" onClick={exportPlan}>
              <ExportOutlined />
            </IconButton>
          </Tooltip>

          <Tooltip title="Toggle group details">
            <IconButton color="inherit" onClick={handleGroupDetails}>
              <UserOutlined />
            </IconButton>
          </Tooltip>

          <Tooltip title="Toggle student details">
            <IconButton color="inherit" onClick={handleStudentDetails}>
              <ClockCircleOutlined />
            </IconButton>
          </Tooltip>

        </Toolbar>
        <>{initialized &&
          <DragAndDrop
            onChange={(container: Map<string, unknown>, placement: Placement) => handleChange(container, placement)}
            items={placementWrappers}
            categories={categories}
            cardRenderer={cellRender}
            headerRenderer={headerRenderer}
          />}
          {!plan &&
            <Typography>No plan found.</Typography>
          }
        </>
      </Box>
    </>
  )
};
