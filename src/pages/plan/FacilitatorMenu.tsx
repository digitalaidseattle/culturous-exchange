/**
 *  GroupCard.tsx
 *
 *  @copyright 2025 Digital Aid Seattle
 *
 */

import { Menu, MenuItem } from '@mui/material';

import { useContext, useEffect, useState } from 'react';
import { CEFacilitatorDao } from '../../api/ceFacilitatorDao';
import { planEvaluator } from '../../api/planEvaluator';
import { addFacilitatorsToGroup } from '../../api/transactions/facilitator/addFacilitatorsToGroup';
import { removeFacilitatorsFromGroup } from '../../api/transactions/facilitator/removeFacilitatorsFromGroup';
import { CEProfile, Facilitator, Group } from '../../api/types';
import AddProfileModal from '../../components/AddProfileModal';
import { UI_STRINGS } from "../../constants";
import { PlanContext } from './PlanContext';

export interface FacilitatorMenuProps {
    group: Group,
    anchorElement: HTMLElement | null,
    onChange: (group: Group | null) => void
}

export const FacilitatorMenu: React.FC<FacilitatorMenuProps> = ({ group, anchorElement, onChange }) => {
    const { plan, setPlan } = useContext(PlanContext);

    const facilitatorDao = CEFacilitatorDao.getInstance();
    const [allFacilitators, setAllFacilitators] = useState<Facilitator[]>([]);
    const [availableFacilitators, setAvailableFacilitators] = useState<Facilitator[]>([]);

    const [showAddFacilitator, setShowAddFacilitator] = useState<boolean>(false);

    const showMenu = Boolean(anchorElement);

    useEffect(() => {
        facilitatorDao.findActive(true)
            .then(ff => setAllFacilitators(ff));
    }, []);

    useEffect(() => {
        if (group) {
            const current = (group.assignments ?? [])
                .map(a => a.facilitator?.id);
            setAvailableFacilitators(allFacilitators.filter(f => !current.includes(f.id)))
        }
    }, [group, allFacilitators])

    const handleClose = () => {
        onChange(null);
    };

    const handleAddMenuChoice = () => {
        setShowAddFacilitator(true);
    };

    const handleCloseModal = () => {
        setShowAddFacilitator(false);
    }

    async function handleRemoveMenuChoice() {
        if (group) {
            const updated = await removeFacilitatorsFromGroup(group);
            const evaluated = await planEvaluator.evaluate(plan);
            setPlan(evaluated);
            onChange(updated!)
        }
    };

    async function handleAddFacilitator(newFacilitators: CEProfile[]) {
        if (group) {
            const updated = await addFacilitatorsToGroup(group, newFacilitators as Facilitator[]);
            const evaluated = await planEvaluator.evaluate(plan);
            setPlan(evaluated);
            setShowAddFacilitator(false);
            onChange(updated!);
        } else {
            console.error('No group in context.')
        }
    }

    return (group &&
        <>
            <Menu
                id="demo-positioned-menu"
                aria-labelledby="demo-positioned-button"
                anchorEl={anchorElement}
                open={showMenu}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                <MenuItem onClick={handleAddMenuChoice}>{UI_STRINGS.CHANGE_FACILITATOR}</MenuItem>
                <MenuItem onClick={handleRemoveMenuChoice} disabled={(group.assignments ?? []).length === 0}>{UI_STRINGS.REMOVE_FACILITATOR}</MenuItem>
            </Menu>
            <AddProfileModal
                title={UI_STRINGS.ADD_FACILITATOR}
                profiles={availableFacilitators}
                isOpen={showAddFacilitator}
                onClose={handleCloseModal}
                onSubmit={handleAddFacilitator} />
        </>
    );
}
